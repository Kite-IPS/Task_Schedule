# task/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .utils import send_task_assignment_email
from .test_email import test_email
from django.db.models import Q, Count
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from .models import Task, TaskAssignment
from .serializers import TaskSerializer, TaskDetailSerializer, TaskCreateSerializer, TaskHistory
from .permissions import IsAdmin, IsHOD, IsAdminOrHOD
from django.http import HttpResponse
import csv
from io import BytesIO
from reportlab.pdfgen import canvas

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """Dashboard stats for all roles"""
    user = request.user
    
    # Get tasks based on role
    if user.role == 'admin' or user.is_superuser:
        tasks = Task.objects.all()
    elif user.role == 'hod':
        tasks = Task.objects.filter(
            assignments__department=user.department
        ).distinct()
    else:  # staff
        tasks = Task.objects.filter(
            assignments__assignee=user
        ).distinct()
    
    # Calculate stats based on status (not priority)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='completed').count()
    ongoing_tasks = tasks.filter(status='pending').count()  # pending = ongoing
    
    return Response({
        'total_task': total_tasks,
        'completed_task': completed_tasks,
        'ongoing_task': ongoing_tasks
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_tasks(request):
    """Get all tasks based on user role"""
    try:
        user = request.user
        
        # Query based on role
        if user.role == 'admin':
            tasks = Task.objects.all()
        elif user.role == 'hod':
            # Get all staff in the HOD's department
            from staff.models import User
            department_staff = User.objects.filter(department=user.department, role='staff')
            
            # Get tasks where any of the department staff are assigned
            tasks = Task.objects.filter(
                assignments__assignee__in=department_staff
            ).distinct()
            
            print(f"HOD Department: {user.department}")
            print(f"Department Staff Count: {department_staff.count()}")
            print(f"Tasks found for HOD's department: {tasks.count()}")
        else:  # staff
            # Staff can see all tasks
            tasks = Task.objects.all()
        
        # Prefetch related data for performance
        tasks = tasks.select_related('created_by').prefetch_related('assignments__assignee')
        
        # Update overdue tasks
        for task in tasks:
            try:
                task.update_status()
            except Exception as e:
                print(f"Error updating status for task {task.id}: {str(e)}")
                continue
        
        serializer = TaskSerializer(tasks, many=True)
        return Response({'tasks': serializer.data})
    except Exception as e:
        print(f"Error in get_all_tasks: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': 'Failed to fetch tasks', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_task(request, task_id):
    """Get, update, or delete a task"""
    user = request.user
    
    try:
        task = Task.objects.select_related('created_by').prefetch_related(
            'assignments__assignee',                                                                        
            'history__performed_by',
            'attachments'
        ).get(id=task_id)
        
        # Check permission
        if user.role == 'hod' and not task.assignments.filter(department=user.department).exists():
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        elif user.role == 'staff' and not task.assignments.filter(assignee=user).exists():
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Handle GET request
        if request.method == 'GET':
            task.update_status()
            serializer = TaskDetailSerializer(task)
            return Response(serializer.data)
        
        # Handle PUT request (Update)
        elif request.method == 'PUT':
            # Permission check: Admin can edit any task, HOD can edit department tasks, 
            # Staff/Faculty can edit tasks they created or are assigned to
            can_edit = (
                user.role == 'admin' or 
                user.is_superuser or
                (user.role == 'hod' and task.assignments.filter(department=user.department).exists()) or
                task.created_by == user or
                task.assignments.filter(assignee=user).exists()
            )
            
            if not can_edit:
                return Response(
                    {'error': 'You do not have permission to update this task'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Capture old values
            changes = {}
            
            if 'title' in request.data and task.title != request.data['title']:
                changes['title'] = {'old': task.title, 'new': request.data['title']}
                task.title = request.data['title']
            
            if 'description' in request.data and task.description != request.data['description']:
                changes['description'] = {'old': task.description, 'new': request.data['description']}
                task.description = request.data['description']
            
            if 'due_date' in request.data:
                new_deadline = request.data['due_date']
                if str(task.due_date) != str(new_deadline):
                    changes['due_date'] = {'old': str(task.due_date), 'new': str(new_deadline)}
                    task.due_date = new_deadline
            
            if 'priority' in request.data and task.priority != request.data['priority']:
                changes['priority'] = {'old': task.priority, 'new': request.data['priority']}
                task.priority = request.data['priority']
            
            if 'status' in request.data and task.status != request.data['status']:
                changes['status'] = {'old': task.status, 'new': request.data['status']}
                task.status = request.data['status']
                
                if task.status == 'completed' and not task.completed_at:
                    task.completed_at = timezone.now()
                elif task.status != 'completed' and task.completed_at:
                    task.completed_at = None
            
            # Handle assignee and department updates
            if 'assignee' in request.data and 'department' in request.data:
                from staff.models import User
                
                # Clear existing assignments
                task.assignments.all().delete()
                
                # Create new assignments
                assignees = request.data['assignee']
                departments = request.data['department']
                
                for email in assignees:
                    user_obj = User.objects.get(email=email)
                    for dept in departments:
                        TaskAssignment.objects.create(
                            task=task,
                            assignee=user_obj,
                            department=dept
                        )
            
            if changes:
                task.save()
                TaskHistory.objects.create(
                    task=task,
                    action='updated',
                    performed_by=request.user,
                    details={'changes': changes, 'updated_fields': list(changes.keys())}
                )
            
            return Response(TaskDetailSerializer(task).data)
        
        # Handle DELETE request
        elif request.method == 'DELETE':
            # Permission check: Admin can delete any task, HOD can delete department tasks,
            # Staff/Faculty can delete tasks they created
            can_delete = (
                user.role == 'admin' or 
                user.is_superuser or
                (user.role == 'hod' and task.assignments.filter(department=user.department).exists()) or
                task.created_by == user
            )
            
            if not can_delete:
                return Response(
                    {'error': 'You do not have permission to delete this task'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrHOD])
def create_task(request):
    """Create new task (Admin/HOD only)"""
    serializer = TaskCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    serializer.is_valid(raise_exception=True)
    
    # Set created_by
    task = serializer.save(created_by=request.user)
    
    # Send email notifications to assigned staff and their HODs
    for assignment in task.assignments.all():
        send_task_assignment_email(task, assignment.assignee)
    
    return Response(
        TaskDetailSerializer(task).data,
        status=status.HTTP_201_CREATED
    )

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_task(request, task_id):
    """Update task details (Admin only)"""
    try:
        task = Task.objects.get(id=task_id)
        
        # Capture old values BEFORE updating
        old_values = {}
        changes = {}
        
        # Track what changed
        if 'title' in request.data and task.title != request.data['title']:
            old_values['title'] = task.title
            task.title = request.data['title']
            changes['title'] = {'old': old_values['title'], 'new': task.title}
        
        if 'description' in request.data and task.description != request.data['description']:
            old_values['description'] = task.description
            task.description = request.data['description']
            changes['description'] = {'old': old_values['description'], 'new': task.description}
        
        if 'due_date' in request.data:  # Note: Your model uses 'due_date', not 'deadline'
            new_deadline = request.data['due_date']
            if str(task.due_date) != str(new_deadline):
                old_values['due_date'] = str(task.due_date)
                task.due_date = new_deadline
                changes['due_date'] = {'old': old_values['due_date'], 'new': str(new_deadline)}
        
        if 'priority' in request.data and task.priority != request.data['priority']:
            old_values['priority'] = task.priority
            task.priority = request.data['priority']
            changes['priority'] = {'old': old_values['priority'], 'new': task.priority}
        
        if 'status' in request.data and task.status != request.data['status']:
            old_values['status'] = task.status
            task.status = request.data['status']
            changes['status'] = {'old': old_values['status'], 'new': task.status}

            if task.status == 'completed' and not task.completed_at:
                task.completed_at = timezone.now()
            elif task.status != 'completed' and task.completed_at:
                task.completed_at = None
        # Only save and create history if something changed
        if changes:
            task.save()
            
            # Create history entry
            TaskHistory.objects.create(
                task=task,
                action='updated',
                performed_by=request.user,
                details={
                    'changes': changes,
                    'updated_fields': list(changes.keys())
                }
            )
        
        return Response(TaskDetailSerializer(task).data)
        
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_task(request, task_id):
    """Delete task (Admin only)"""
    try:
        task = Task.objects.get(id=task_id)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def generate_task_pdf(request):
    """Generate PDF report of all tasks"""
    tasks = Task.objects.select_related('created_by').prefetch_related('assignments')
    
    # Create PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    
    y = 800
    p.drawString(100, y, "Task Management Report")
    y -= 30
    
    for task in tasks:
        if y < 100:
            p.showPage()
            y = 800
        
        p.drawString(100, y, f"{task.title} - {task.priority}")
        y -= 20
    
    p.save()
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="tasks_report.pdf"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_task_history(request):
    """Get recent task history/activity based on user role"""
    from .serializers import TaskHistorySerializer
    user = request.user
    
    # Get history based on role
    if user.role == 'admin' or user.is_superuser:
        # Admin sees all history
        history = TaskHistory.objects.select_related(
            'task', 'performed_by'
        ).all()[:10]
    elif user.role == 'hod':
        # HOD sees history for tasks in their department
        history = TaskHistory.objects.select_related(
            'task', 'performed_by'
        ).filter(
            task__assignments__department=user.department
        ).distinct()[:10]
    else:  # staff
        # Staff sees all task history
        history = TaskHistory.objects.select_related(
            'task', 'performed_by'
        ).all()[:10]
    
    serializer = TaskHistorySerializer(history, many=True)
    return Response({'activities': serializer.data})
