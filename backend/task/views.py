# task/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
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
    
    # Calculate stats
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(priority='completed').count()
    ongoing_tasks = tasks.filter(priority='on-going').count()
    
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
    
    return Response(
        TaskDetailSerializer(task).data,
        status=status.HTTP_201_CREATED
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
