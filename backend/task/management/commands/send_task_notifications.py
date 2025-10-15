from django.core.management.base import BaseCommand
from django.utils import timezone
from task.models import Task
from task.utils import send_deadline_reminder_email, send_overdue_notification
from datetime import timedelta

class Command(BaseCommand):
    help = 'Send deadline reminder emails for tasks'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # Get tasks that are due within next 24 hours
        upcoming_tasks = Task.objects.filter(
            status='pending',
            deadline__gt=now,
            deadline__lte=now + timedelta(hours=24)
        ).select_related('created_by').prefetch_related('assignments__assignee')

        # Send reminders for upcoming deadlines
        for task in upcoming_tasks:
            for assignment in task.assignments.all():
                hours_until_deadline = (task.deadline - now).total_seconds() / 3600
                # Send reminder every 4 hours when deadline is within 24 hours
                if hours_until_deadline % 4 < 0.1:  # Check if it's close to a 4-hour mark
                    send_deadline_reminder_email(task, assignment.assignee)
        
        # Get overdue tasks
        overdue_tasks = Task.objects.filter(
            status='pending',
            deadline__lt=now
        ).select_related('created_by').prefetch_related('assignments__assignee')

        # Send overdue notifications
        for task in overdue_tasks:
            for assignment in task.assignments.all():
                send_overdue_notification(task, assignment.assignee)
                
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed {upcoming_tasks.count()} upcoming and {overdue_tasks.count()} overdue tasks'
            )
        )