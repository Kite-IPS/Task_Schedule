# task/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .utils import send_task_assignment_email
from django.db.models import Q, Count
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from .models import Task, TaskAssignment
from .serializers import TaskSerializer, TaskDetailSerializer, TaskCreateSerializer
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
    user = request.user
    
    # Query based on role
    if user.role == 'admin':
        tasks = Task.objects.all()
    elif user.role == 'hod':
        tasks = Task.objects.filter(
            assignments__department=user.department
        ).distinct()
    else:  # staff
        tasks = Task.objects.filter(
            assignments__assignee=user
        ).distinct()
    
    # Prefetch related data for performance
    tasks = tasks.select_related('created_by').prefetch_related('assignments__assignee')
    
    # Update overdue tasks
    for task in tasks:
        task.update_status()
    
    serializer = TaskSerializer(tasks, many=True)
    return Response({'tasks': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_task(request, task_id):
    """Get single task details with history"""
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
        
        task.update_status()
        serializer = TaskDetailSerializer(task)
        return Response(serializer.data)
        
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
        
        # Update fields
        if 'title' in request.data:
            task.title = request.data['title']
        if 'description' in request.data:
            task.description = request.data['description']
        if 'deadline' in request.data:
            task.deadline = request.data['deadline']
        if 'priority' in request.data:
            task.priority = request.data['priority']
        
        task.save()
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
