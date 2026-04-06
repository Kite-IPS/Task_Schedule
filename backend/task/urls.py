from django.urls import path
from . import views

urlpatterns = [
    # Common endpoints
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('tasks/', views.get_all_tasks, name='get-all-tasks'),
    path('tasks/<int:task_id>/', views.get_task, name='get-task'),  # Handles GET, PUT, DELETE
    path('tasks/create/', views.create_task, name='create-task'),
    path('tasks/history/', views.get_task_history, name='get-task-history'),
    path('tasks/<int:task_id>/comments/', views.get_task_comments, name='get-task-comments'),
    path('tasks/comments/', views.get_all_follow_comments, name='get-all-follow-comments'),
    
    # Admin only
    path('tasks/generate-pdf/', views.generate_task_pdf, name='generate-task-pdf'),
    
    # Test email
    path('test-email/', views.test_email, name='test-email'),
]