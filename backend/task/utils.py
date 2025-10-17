from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
from staff.models import User  # Import User model for HOD lookup

# ----------------------------------------------------------------------
# ✉️ PROFESSIONAL HTML TEMPLATES
# ----------------------------------------------------------------------

def get_task_assignment_html(task, assignee):
    initiated_by = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #2c3e50;">New Task Assigned</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>You have been assigned a new task. Please find the details below:</p>
        
        <div style="border-left: 4px solid #007bff; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {task.due_date.strftime('%B %d, %Y, %I:%M %p')}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {initiated_by}</p>
        </div>

        <p>Please begin working on this task at your earliest convenience. If you have any questions or require clarification, feel free to reach out.</p>
        
        <p style="margin-top: 24px;">Kind regards,<br><strong>Task Management System</strong></p>
    </div>
    """


def get_task_assignment_hod_html(task, staff_name):
    initiated_by = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #2c3e50;">Task Assignment Notification</h2>
        <p>Dear HOD,</p>
        <p>A member of your department (<strong>{staff_name}</strong>) has been assigned a new task.</p>
        
        <div style="border-left: 4px solid #007bff; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {task.due_date.strftime('%B %d, %Y, %I:%M %p')}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {initiated_by}</p>
        </div>

        <p>Kindly note this assignment for departmental tracking and review.</p>
        
        <p style="margin-top: 24px;">Best regards,<br><strong>Task Management System</strong></p>
    </div>
    """


def get_deadline_reminder_html(task, assignee, hours_left):
    initiated_by = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #e67e22;">Task Deadline Reminder</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>This is a friendly reminder that your task deadline is approaching. You have approximately <strong>{hours_left} hours</strong> remaining.</p>
        
        <div style="border-left: 4px solid #f39c12; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {task.due_date.strftime('%B %d, %Y, %I:%M %p')}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {initiated_by}</p>
        </div>

        <p>Please ensure to complete the task on time. Thank you for your diligence.</p>
        
        <p style="margin-top: 24px;">Warm regards,<br><strong>Task Management System</strong></p>
    </div>
    """


def get_overdue_html(task, assignee):
    initiated_by = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #dc3545;">Task Overdue Notice</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>This is to notify you that the following task has passed its due date and is now overdue:</p>
        
        <div style="border-left: 4px solid #dc3545; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {task.due_date.strftime('%B %d, %Y, %I:%M %p')}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {initiated_by}</p>
        </div>

        <p>Please prioritize completing this task as soon as possible and update the task status accordingly.</p>
        
        <p style="margin-top: 24px;">Sincerely,<br><strong>Task Management System</strong></p>
    </div>
    """

# ----------------------------------------------------------------------
# ✉️ EMAIL SENDING FUNCTIONS
# ----------------------------------------------------------------------

def send_task_assignment_email(task, assignee):
    """Send email to assignee and notify HOD/admins."""
    try:
        subject = task.title  # ✅ Subject is always the title
        
        html_message = get_task_assignment_html(task, assignee)
        recipient_list = [assignee.email]

        # Include HOD
        if assignee.department:
            hod = User.objects.filter(department=assignee.department, role='hod').first()
            if hod and hod.email:
                recipient_list.append(hod.email)

        # Include all admins
        admin_emails = User.objects.filter(
            Q(role='admin') | Q(is_superuser=True)
        ).values_list('email', flat=True).distinct()
        recipient_list.extend(admin_emails)

        # Remove duplicates / invalids
        recipient_list = list(set(filter(None, recipient_list)))

        print(f"Sending email for task '{task.title}' to: {recipient_list}")

        send_mail(
            subject=subject,
            message='',
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False
        )

    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending task assignment email: {str(e)}")


def send_deadline_reminder_email(task, assignee):
    """Send deadline reminder email."""
    try:
        subject = task.title  # ✅ Only title
        time_left = task.due_date - timezone.now()
        hours_left = int(time_left.total_seconds() / 3600)

        html_message = get_deadline_reminder_html(task, assignee, hours_left)
        send_mail(
            subject=subject,
            message='',
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[assignee.email],
            fail_silently=True
        )
    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending deadline reminder email: {str(e)}")


def send_overdue_notification(task, assignee):
    """Send overdue notification email."""
    try:
        subject = task.title  # ✅ Only title
        html_message = get_overdue_html(task, assignee)
        send_mail(
            subject=subject,
            message='',
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[assignee.email],
            fail_silently=True
        )
    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending overdue notification email: {str(e)}")
