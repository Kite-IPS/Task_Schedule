# task/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

class Task(models.Model):
    """Main task model with hierarchical delegation support"""
    
    PRIORITY_CHOICES = [
        ('urgent', 'Urgent'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateTimeField()
    
    completed_at = models.DateTimeField(null=True, blank=True)  
    created_by = models.CharField(max_length=255, help_text="Name of the person who requested this task")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Reminder fields
    reminder1 = models.DateTimeField(null=True, blank=True, help_text="First reminder date and time")
    reminder2 = models.DateTimeField(null=True, blank=True, help_text="Second reminder date and time")
    
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
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['created_by']),
        ]
    
    def __str__(self):
        return self.title
    
    def update_status(self):
        """Auto-update status based on due date"""
        try:
            if self.status != 'completed' and self.due_date:
                # Ensure both datetimes are timezone-aware
                now = timezone.now()
                due_date = self.due_date
                
                # Make due_date timezone-aware if it isn't
                if timezone.is_naive(due_date):
                    due_date = timezone.make_aware(due_date)
                
                if now > due_date:
                    self.status = 'overdue'
                    self.save(update_fields=['status'])
        except Exception as e:
            # Log the error but don't break the API
            print(f"Error updating task status for task {self.id}: {str(e)}")


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