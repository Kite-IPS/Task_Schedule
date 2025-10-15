from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

def get_task_assignment_html(task, assignee):
    return f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Task Assignment</h2>
        <p>Hello {assignee.get_full_name()},</p>
        <p>You have been assigned a new task:</p>
        
        <h3>{task.title}</h3>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Deadline:</strong> {task.deadline.strftime('%B %d, %Y, %I:%M %p')}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        
        <p>
            <a href="{settings.FRONTEND_URL}/task/{task.id}" 
               style="display: inline-block; padding: 10px 20px; background-color: #007bff; 
                      color: white; text-decoration: none; border-radius: 5px;">
                View Task
            </a>
        </p>
        
        <p>Please start working on this task as soon as possible.</p>
        
        <p>Best regards,<br>Task Management System</p>
    </div>
    """

def get_task_assignment_hod_html(task, staff_name):
    return f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Task Assignment Notification</h2>
        <p>Hello,</p>
        <p>A member of your department ({staff_name}) has been assigned a new task:</p>
        
        <h3>{task.title}</h3>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Deadline:</strong> {task.deadline.strftime('%B %d, %Y, %I:%M %p')}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        
        <p>
            <a href="{settings.FRONTEND_URL}/task/{task.id}"
               style="display: inline-block; padding: 10px 20px; background-color: #007bff;
                      color: white; text-decoration: none; border-radius: 5px;">
                View Task
            </a>
        </p>
        
        <p>Best regards,<br>Task Management System</p>
    </div>
    """

def get_deadline_reminder_html(task, assignee, hours_left):
    return f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Task Deadline Reminder</h2>
        <p>Hello {assignee.get_full_name()},</p>
        
        <p style="color: #dc3545;">
            <strong>Your task deadline is approaching! Only {hours_left} hours remaining.</strong>
        </p>
        
        <h3>{task.title}</h3>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Deadline:</strong> {task.deadline.strftime('%B %d, %Y, %I:%M %p')}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        
        <p>
            <a href="{settings.FRONTEND_URL}/task/{task.id}"
               style="display: inline-block; padding: 10px 20px; background-color: #dc3545;
                      color: white; text-decoration: none; border-radius: 5px;">
                View Task
            </a>
        </p>
        
        <p>Please ensure to complete the task before the deadline.</p>
        
        <p>Best regards,<br>Task Management System</p>
    </div>
    """

def get_overdue_html(task, assignee):
    return f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Task Overdue Notice</h2>
        <p>Hello {assignee.get_full_name()},</p>
        
        <p style="color: #dc3545;">
            <strong>The following task has passed its deadline and is now overdue!</strong>
        </p>
        
        <h3>{task.title}</h3>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Deadline:</strong> {task.deadline.strftime('%B %d, %Y, %I:%M %p')}</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        
        <p>
            <a href="{settings.FRONTEND_URL}/task/{task.id}"
               style="display: inline-block; padding: 10px 20px; background-color: #dc3545;
                      color: white; text-decoration: none; border-radius: 5px;">
                View Task
            </a>
        </p>
        
        <p>Please complete this task as soon as possible and update its status.</p>
        
        <p>Best regards,<br>Task Management System</p>
    </div>
    """

def send_task_assignment_email(task, assignee):
    """Send email to staff member when assigned to a task"""
    try:
        subject = f'New Task Assignment: {task.title}'
        
        # Email to staff
        html_message = get_task_assignment_html(task, assignee)
        send_mail(
            subject=subject,
            message='',  # HTML-only email
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[assignee.email],
            fail_silently=True
        )

        # Email to HOD
        if assignee.department and assignee.department.hod:
            hod = assignee.department.hod
            if hod.email:  # Check if HOD has an email
                hod_html_message = get_task_assignment_hod_html(task, assignee.get_full_name())
                send_mail(
                    subject=f'Task Assignment Notification: {task.title}',
                    message='',  # HTML-only email
                    html_message=hod_html_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[hod.email],
                    fail_silently=True
                )
    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending task assignment email: {str(e)}")
        # Don't raise the exception to prevent breaking the application flow

def send_deadline_reminder_email(task, assignee):
    """Send deadline reminder email to staff"""
    try:
        subject = f'Deadline Reminder: {task.title}'
        time_left = task.deadline - timezone.now()
        hours_left = int(time_left.total_seconds() / 3600)

        html_message = get_deadline_reminder_html(task, assignee, hours_left)
        send_mail(
            subject=subject,
            message='',  # HTML-only email
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[assignee.email],
            fail_silently=True
        )
    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending deadline reminder email: {str(e)}")
        # Don't raise the exception to prevent breaking the application flow

def send_overdue_notification(task, assignee):
    """Send overdue notification email"""
    try:
        subject = f'Task Overdue: {task.title}'
        
        html_message = get_overdue_html(task, assignee)
        send_mail(
            subject=subject,
            message='',  # HTML-only email
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[assignee.email],
            fail_silently=True
        )
    except Exception as e:
        if settings.DEBUG:
            print(f"Error sending overdue notification email: {str(e)}")
        # Don't raise the exception to prevent breaking the application flow