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
]