from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
from staff.models import User  # Import User model for HOD lookup

def format_date(dt):
    """Converts UTC datetime to local timezone (Asia/Kolkata) and formats it"""
    if not dt:
        return "No date set"
    local_dt = timezone.localtime(dt)
    return local_dt.strftime('%B %d, %Y, %I:%M %p')
def get_signature_details(name_str):
    """Extracts name and role, mapping 'Admin' to 'Principal' where needed"""
    import re
    if not name_str:
        return "Task Management System", "", "KGiSL Institute of Technology"
    
    # Try to find name and role in brackets
    match = re.search(r'^(.*?)\s*\(([^)]*)\)$', str(name_str))
    if match:
        name = match.group(1).strip()
        role = match.group(2).strip()
        # Map Admin specifically to Principal as requested
        designation = "Principal" if role.lower() == "admin" else role
        return name, designation, "KGiSL Institute of Technology"
    
    # Fallback if no brackets
    return str(name_str).strip(), "Principal", "KGiSL Institute of Technology"

def get_task_assignment_html(task, assignee):
    raw_initiator = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    name, designation, institution = get_signature_details(raw_initiator)
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #2c3e50;">New Task Assigned</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>You have been assigned a new task. Please find the details below:</p>
        <div style="border-left: 4px solid #007bff; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {format_date(task.due_date)}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {name}</p>
        </div>
        <p>Please begin working on this task at your earliest convenience. If you have any questions or require clarification, feel free to reach out.</p> 
        <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>{name}</strong>,<br>
            {designation},<br>
            {institution}.
        </p>
    </div>
    """
def get_task_assignment_hod_html(task, staff_name):
    raw_initiator = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    name, designation, institution = get_signature_details(raw_initiator)
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #2c3e50;">Task Assignment Notification</h2>
        <p>Dear HOD,</p>
        <p>A member of your department (<strong>{staff_name}</strong>) has been assigned a new task.</p>
        <div style="border-left: 4px solid #007bff; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {format_date(task.due_date)}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {name}</p>
        </div>
        <p>Kindly note this assignment for departmental tracking and review.</p> 
        <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>{name}</strong>,<br>
            {designation},<br>
            {institution}.
        </p>
    </div>
    """
def get_deadline_reminder_html(task, assignee):
    raw_initiator = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    name, designation, institution = get_signature_details(raw_initiator)
    
    time_diff = task.due_date - timezone.now()
    total_seconds = int(time_diff.total_seconds())
    
    if total_seconds > 86400:
        time_display = f"<strong>{total_seconds // 86400} days</strong>"
    elif total_seconds > 3600:
        time_display = f"<strong>{total_seconds // 3600} hours</strong>"
    else:
        time_display = f"<strong>{max(0, total_seconds // 60)} minutes</strong>"

    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #e67e22;">Task Deadline Reminder</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>This is a friendly reminder that your task deadline is approaching. You have approximately {time_display} remaining.</p>
        <div style="border-left: 4px solid #f39c12; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {format_date(task.due_date)}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {name}</p>
        </div>
        <p>Please ensure to complete the task on time. Thank you for your diligence.</p> 
        <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>{name}</strong>,<br>
            {designation},<br>
            {institution}.
        </p>
    </div>
    """
def get_overdue_html(task, assignee):
    raw_initiator = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    name, designation, institution = get_signature_details(raw_initiator)
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #dc3545;">Task Overdue Notice</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>This is to notify you that the following task has passed its due date and is now overdue:</p>
        <div style="border-left: 4px solid #dc3545; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {format_date(task.due_date)}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {name}</p>
        </div>
        <p>Please prioritize completing this task as soon as possible and update the task status accordingly.</p> 
        <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>{name}</strong>,<br>
            {designation},<br>
            {institution}.
        </p>
    </div>
    """
def send_task_assignment_email(task, assignee):
    """Send email to assignee and notify HOD/admins."""
    try:
        subject = task.title  # ✅ Subject is always the title
        html_message = get_task_assignment_html(task, assignee)
        recipient_list = [assignee.email]
        cc_list = []
        
        # Include custom CC emails
        if task.cc_emails:
            cc_list.extend(task.cc_emails)
        
        # Remove duplicates / invalids
        cc_list = list(set(filter(None, cc_list)))
        
        print(f"Sending email for task '{task.title}' to: {recipient_list} with CC: {cc_list}")
        
        email = EmailMessage(
            subject=subject,
            body=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list,
            cc=cc_list
        )
        email.content_subtype = "html"
        email.send(fail_silently=False)
    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending task assignment email: {str(e)}")
def send_deadline_reminder_email(task, assignee):
    """Send deadline reminder email."""
    try:
        subject = task.title  # ✅ Only title
        html_message = get_deadline_reminder_html(task, assignee)
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

def get_status_update_html(task, assignee, old_status, new_status):
    """Generate HTML for status update email."""
    raw_initiator = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    name, designation, institution = get_signature_details(raw_initiator)
    
    # Format status for better readability
    def format_status(status_value):
        return status_value.replace('_', ' ').title()
    
    old_status_formatted = format_status(old_status)
    new_status_formatted = format_status(new_status)
    
    # Determine color based on new status
    status_color = {
        'completed': '#28a745',  # Green for completed
        'pending': '#ffc107',    # Yellow for pending
        'ongoing': '#17a2b8',    # Blue for ongoing
        'overdue': '#dc3545',    # Red for overdue
    }.get(new_status, '#6c757d')  # Default gray
    
    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: {status_color};">Task Status Changed</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>The status of a task assigned to you has been updated from <strong>{old_status_formatted}</strong> to <strong>{new_status_formatted}</strong>.</p>
        <div style="border-left: 4px solid {status_color}; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {format_date(task.due_date)}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {name}</p>
        </div>
        <p>Please review this update and take any necessary actions.</p> 
        <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>{name}</strong>,<br>
            {designation},<br>
            {institution}.
        </p>
    </div>
    """

def get_daily_reminder_html(task, assignee):
    """Generate HTML for daily reminder email."""
    raw_initiator = task.created_by.get_full_name() if hasattr(task.created_by, "get_full_name") else str(task.created_by)
    name, designation, institution = get_signature_details(raw_initiator)
    
    time_diff = task.due_date - timezone.now()
    total_seconds = int(time_diff.total_seconds())
    
    if total_seconds > 86400:
        time_display = f"<strong>{total_seconds // 86400} days</strong>"
    elif total_seconds > 3600:
        time_display = f"<strong>{total_seconds // 3600} hours</strong>"
    else:
        time_display = f"<strong>{max(0, total_seconds // 60)} minutes</strong>"

    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #2c3e50;">Task Reminder</h2>
        <p>Dear {assignee.get_full_name()},</p>
        <p>This is your reminder for the task assigned to you. You have approximately {time_display} remaining before the deadline.</p>
        <div style="border-left: 4px solid #007bff; padding-left: 12px; margin: 16px 0;">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Due Date:</strong> {format_date(task.due_date)}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Initiated by:</strong> {name}</p>
        </div>
        <p>Please continue working on this task and ensure its completion by the deadline.</p> 
        <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>{name}</strong>,<br>
            {designation},<br>
            {institution}.
        </p>
    </div>
    """

def send_daily_8am_reminders():
    """Find all active tasks and send daily reminders to assignees."""
    from .models import Task
    now = timezone.now()
    
    # Find active tasks (pending or ongoing) that are not overdue
    tasks = Task.objects.filter(
        due_date__gt=now
    ).filter(
        Q(status='pending') | Q(status='ongoing')
    ).prefetch_related('assignments__assignee')
    
    count = 0
    for task in tasks:
        for assignment in task.assignments.all():
            try:
                subject = f"Daily Reminder: {task.title}"
                html_message = get_daily_reminder_html(task, assignment.assignee)
                send_mail(
                    subject=subject,
                    message='',
                    html_message=html_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[assignment.assignee.email],
                    fail_silently=False
                )
                count += 1
            except Exception as e:
                print(f"Error sending daily reminder for task {task.id}: {str(e)}")
    
    return count

def send_status_update_email(task, assignee, old_status, new_status):
    """Send email about task status updates."""
    try:
        subject = f"Status Update: {task.title}"
        html_message = get_status_update_html(task, assignee, old_status, new_status)
        recipient_list = [assignee.email]
        cc_list = []
        
        # Include custom CC emails
        if task.cc_emails:
            cc_list.extend(task.cc_emails)
        
        # Remove duplicates / invalids
        cc_list = list(set(filter(None, cc_list)))
        
        email = EmailMessage(
            subject=subject,
            body=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list,
            cc=cc_list
        )
        email.content_subtype = "html"
        email.send(fail_silently=True)
        return True
    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending status update email: {str(e)}")
        return False