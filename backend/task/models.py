# task/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

class Task(models.Model):
    """Main task model with hierarchical delegation support"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('on-going', 'On-going'),
        ('completed', 'Completed'),
        ('over-due', 'Over-due'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateTimeField()
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Parent task for hierarchical delegation
    parent_task = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subtasks'
    )
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['priority']),
            models.Index(fields=['due_date']),
            models.Index(fields=['created_by']),
        ]
    
    def __str__(self):
        return self.title
    
    def update_status(self):
        """Auto-update status based on due date"""
        if self.priority != 'completed' and timezone.now() > self.due_date:
            self.priority = 'over-due'
            self.save(update_fields=['priority'])


class TaskAssignment(models.Model):
    """Many-to-many relationship between tasks and assignees with departments"""
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='assignments')
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_tasks'
    )
    department = models.CharField(max_length=50)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'task_assignments'
        unique_together = ['task', 'assignee']
        indexes = [
            models.Index(fields=['task', 'assignee']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.task.title} -> {self.assignee.get_full_name()}"


class TaskHistory(models.Model):
    """Complete audit trail for all task changes"""
    
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('assigned', 'Assigned'),
        ('updated', 'Updated'),
        ('status_changed', 'Status Changed'),
        ('completed', 'Completed'),
        ('delegated', 'Delegated'),
    ]
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)  # Store change details
    
    class Meta:
        db_table = 'task_history'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['task', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.task.title} - {self.action} by {self.performed_by}"


class TaskAttachment(models.Model):
    """File attachments for tasks"""
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_attachments/%Y/%m/%d/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    
    class Meta:
        db_table = 'task_attachments'