from django.urls import path
from . import views

urlpatterns = [
    # Common endpoints
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('tasks/', views.get_all_tasks, name='get-all-tasks'),
    path('tasks/<int:task_id>/', views.get_task, name='get-task'),
    path('tasks/create/', views.create_task, name='create-task'),
    
    # Admin only
    path('tasks/generate-pdf/', views.generate_task_pdf, name='generate-task-pdf'),
    path('tasks/<int:task_id>/update/', views.update_task, name='update-task'),
    path('tasks/<int:task_id>/delete/', views.delete_task, name='delete-task'),
    
    # Test email
    path('test-email/', views.test_email, name='test-email'),
]