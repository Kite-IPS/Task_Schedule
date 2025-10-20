from django.core.management.base import BaseCommand
from django.utils import timezone
from task.models import Task
from task.utils import send_deadline_reminder_email, send_overdue_notification
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Send deadline reminder emails for tasks'

    def send_custom_reminder_email(self, task, assignee, reminder_type):
        """Send custom reminder email for reminder1 or reminder2"""
        try:
            subject = f"Reminder: {task.title}"
            
            # HTML message for custom reminders
            html_message = f"""
            <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
                <h2 style="color: #9C27B0;">Task Reminder</h2>
                <p>Dear {assignee.get_full_name()},</p>
                <p>This is a scheduled reminder for your task:</p>
                <div style="border-left: 4px solid #9C27B0; padding-left: 12px; margin: 16px 0;">
                    <p><strong>Title:</strong> {task.title}</p>
                    <p><strong>Description:</strong> {task.description}</p>
                    <p><strong>Due Date:</strong> {task.due_date.strftime('%B %d, %Y, %I:%M %p')}</p>
                    <p><strong>Priority:</strong> {task.priority}</p>
                    <p><strong>Reminder Type:</strong> {reminder_type}</p>
                </div>
                <p>Please make sure to complete this task before the due date.</p> 
                <p style="margin-top: 24px;">Best regards,<br><strong>Task Management System</strong></p>
            </div>
            """
            
            send_mail(
                subject=subject,
                message='',
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[assignee.email],
                fail_silently=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(f"Sent {reminder_type} email for task '{task.title}' to {assignee.email}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error sending {reminder_type} email: {str(e)}")
            )

    def handle(self, *args, **options):
        now = timezone.now()
        
        # Get tasks that are due within next 24 hours
        upcoming_tasks = Task.objects.filter(
            status='pending',
            due_date__gt=now,
            due_date__lte=now + timedelta(hours=24)
        ).select_related('created_by').prefetch_related('assignments__assignee')

        # Send reminders for upcoming deadlines
        for task in upcoming_tasks:
            for assignment in task.assignments.all():
                hours_until_deadline = (task.due_date - now).total_seconds() / 3600
                # Send reminder every 4 hours when deadline is within 24 hours
                if hours_until_deadline % 4 < 0.1:  # Check if it's close to a 4-hour mark
                    send_deadline_reminder_email(task, assignment.assignee)
        
        # Get overdue tasks
        overdue_tasks = Task.objects.filter(
            status='pending',
            due_date__lt=now
        ).select_related('created_by').prefetch_related('assignments__assignee')

        # Send overdue notifications
        for task in overdue_tasks:
            for assignment in task.assignments.all():
                send_overdue_notification(task, assignment.assignee)
        
        # Check for custom reminder1 tasks
        # Buffer of 5 minutes to catch tasks that might have just crossed the reminder time
        reminder1_buffer = timedelta(minutes=5)
        reminder1_tasks = Task.objects.filter(
            status='pending',
            reminder1__isnull=False,
            reminder1__lte=now + reminder1_buffer,
            reminder1__gte=now - reminder1_buffer
        ).select_related('created_by').prefetch_related('assignments__assignee')
        
        # Send reminder1 notifications
        for task in reminder1_tasks:
            for assignment in task.assignments.all():
                self.send_custom_reminder_email(task, assignment.assignee, "First Reminder")
        
        # Check for custom reminder2 tasks
        reminder2_tasks = Task.objects.filter(
            status='pending',
            reminder2__isnull=False,
            reminder2__lte=now + reminder1_buffer,
            reminder2__gte=now - reminder1_buffer
        ).select_related('created_by').prefetch_related('assignments__assignee')
        
        # Send reminder2 notifications
        for task in reminder2_tasks:
            for assignment in task.assignments.all():
                self.send_custom_reminder_email(task, assignment.assignee, "Second Reminder")
                
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed: {upcoming_tasks.count()} upcoming, {overdue_tasks.count()} overdue, ' +
                f'{reminder1_tasks.count()} first reminders, and {reminder2_tasks.count()} second reminders'
            )
        )