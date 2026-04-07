from django.core.management.base import BaseCommand
from django.utils import timezone
from task.models import Task
from task.utils import send_deadline_reminder_email, send_overdue_notification
from datetime import timedelta
from django.db.models import Q

class Command(BaseCommand):
    help = 'Send deadline and overdue reminder emails for tasks'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # 1. Upcoming Deadline Reminders (within next 24 hours)
        upcoming_tasks = Task.objects.filter(
            Q(status='pending') | Q(status='ongoing'),
            due_date__gt=now,
            due_date__lte=now + timedelta(hours=24)
        ).select_related('created_by').prefetch_related('assignments__assignee')

        upcoming_count = 0
        for task in upcoming_tasks:
            for assignment in task.assignments.all():
                hours_until_deadline = (task.due_date - now).total_seconds() / 3600
                # Send reminder every 4 hours when deadline is within 24 hours
                if hours_until_deadline % 4 < 0.1:  # Check if it's close to a 4-hour mark
                    send_deadline_reminder_email(task, assignment.assignee)
                    upcoming_count += 1
        
        # 2. Overdue Notifications
        overdue_tasks = Task.objects.filter(
            Q(status='pending') | Q(status='ongoing'),
            due_date__lt=now
        ).select_related('created_by').prefetch_related('assignments__assignee')

        overdue_count = 0
        for task in overdue_tasks:
            for assignment in task.assignments.all():
                send_overdue_notification(task, assignment.assignee)
                overdue_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed: {upcoming_count} upcoming reminders and {overdue_count} overdue notifications'
            )
        )