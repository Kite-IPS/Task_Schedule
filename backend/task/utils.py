from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
from datetime import timedelta

def send_task_assignment_email(task, assignee):
    """Send email to staff member when assigned to a task"""
    subject = f'New Task Assignment: {task.title}'
    context = {
        'task': task,
        'assignee': assignee,
        'task_url': f"{settings.FRONTEND_URL}/task/{task.id}"
    }
    
    # Email to staff
    html_message = render_to_string('task/email/task_assignment.html', context)
    send_mail(
        subject=subject,
        message=strip_tags(html_message),
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[assignee.email],
        fail_silently=False
    )

    # Email to HOD
    if assignee.department and assignee.department.hod:
        hod = assignee.department.hod
        hod_context = {
            **context,
            'staff_name': assignee.get_full_name()
        }
        hod_html_message = render_to_string('task/email/task_assignment_hod.html', hod_context)
        send_mail(
            subject=f'Task Assignment Notification: {task.title}',
            message=strip_tags(hod_html_message),
            html_message=hod_html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[hod.email],
            fail_silently=False
        )

def send_deadline_reminder_email(task, assignee):
    """Send deadline reminder email to staff"""
    subject = f'Deadline Reminder: {task.title}'
    time_left = task.deadline - timezone.now()
    hours_left = time_left.total_seconds() / 3600

    context = {
        'task': task,
        'assignee': assignee,
        'hours_left': int(hours_left),
        'task_url': f"{settings.FRONTEND_URL}/task/{task.id}"
    }
    
    html_message = render_to_string('task/email/deadline_reminder.html', context)
    send_mail(
        subject=subject,
        message=strip_tags(html_message),
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[assignee.email],
        fail_silently=False
    )

def send_overdue_notification(task, assignee):
    """Send overdue notification email"""
    subject = f'Task Overdue: {task.title}'
    context = {
        'task': task,
        'assignee': assignee,
        'task_url': f"{settings.FRONTEND_URL}/task/{task.id}"
    }
    
    html_message = render_to_string('task/email/task_overdue.html', context)
    send_mail(
        subject=subject,
        message=strip_tags(html_message),
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[assignee.email],
        fail_silently=False
    )