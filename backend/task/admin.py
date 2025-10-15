# task/admin.py
from django.contrib import admin
from .models import Task, TaskAssignment, TaskHistory, TaskAttachment

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'priority', 'due_date', 'created_by', 'created_at']
    list_filter = ['priority', 'created_at', 'due_date']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Task Information', {
            'fields': ('title', 'description', 'priority', 'due_date')
        }),
        ('Hierarchy', {
            'fields': ('parent_task',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ['task', 'assignee', 'department', 'assigned_at', 'completed_at']
    list_filter = ['department', 'assigned_at']
    search_fields = ['task__title', 'assignee__email']
    date_hierarchy = 'assigned_at'


@admin.register(TaskHistory)
class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ['task', 'action', 'performed_by', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['task__title', 'performed_by__email']
    date_hierarchy = 'timestamp'
    readonly_fields = ['task', 'action', 'performed_by', 'timestamp', 'details']


@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    list_display = ['task', 'file_name', 'uploaded_by', 'uploaded_at', 'file_size']
    list_filter = ['uploaded_at']
    search_fields = ['task__title', 'file_name']
    date_hierarchy = 'uploaded_at'
    readonly_fields = ['uploaded_at']
