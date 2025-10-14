from django.db import models
from staff.models import Staff

class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        OVERDUE = 'OVERDUE', 'Overdue'

    title = models.CharField(max_length=200)
    description = models.TextField()
    issued_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,  # Allow null for existing records
        related_name='issued_tasks'
    )
    issued_on = models.DateTimeField(auto_now_add=True)
    last_edited_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='edited_tasks'
    )
    last_edited_on = models.DateTimeField(null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)  # Allow null for existing records
    deadline_modification_history = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    assigned_to = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,  # Allow null for existing records
        related_name='assigned_tasks'
    )
    staff_hod = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,  # Allow null for existing records
        related_name='department_tasks',
        limit_choices_to={'role': Staff.Roles.HOD}
    )
    department = models.CharField(max_length=100, default='General')  # Default for existing records

    def __str__(self):
        return f"{self.title} - {self.department}"

    def extend_deadline(self, new_deadline, modified_by):
        """
        Extends the task deadline and maintains modification history
        """
        modification = {
            'previous_deadline': self.deadline.isoformat(),
            'new_deadline': new_deadline.isoformat(),
            'modified_by': modified_by.id,
            'modified_on': models.timezone.now().isoformat()
        }
        
        if isinstance(self.deadline_modification_history, list):
            self.deadline_modification_history.append(modification)
        else:
            self.deadline_modification_history = [modification]
        
        self.deadline = new_deadline
        self.last_edited_by = modified_by
        self.last_edited_on = models.timezone.now()
        self.save()

    class Meta:
        ordering = ['-issued_on']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
