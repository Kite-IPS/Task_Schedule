from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_email(request):
    """Test email functionality"""
    try:
        send_mail(
            subject='Test Email from Task Schedule',
            message='This is a test email from your Task Schedule application.',
            html_message="""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #007bff;">Task Schedule Test Email</h2>
                    <p>This is a test email to verify the email functionality.</p>
                    <p>If you received this email, it means your email configuration is working correctly.</p>
                    <p>Details:</p>
                    <ul>
                        <li>Sent to: {}</li>
                        <li>Sent at: {}</li>
                        <li>From: {}</li>
                    </ul>
                    <p style="margin-top: 20px;">Best regards,<br>Task Schedule System</p>
                </div>
            """.format(
                request.user.email,
                settings.EMAIL_HOST_USER,
                settings.DEFAULT_FROM_EMAIL
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[request.user.email],
            fail_silently=False
        )
        return Response({
            'message': 'Test email sent successfully',
            'sent_to': request.user.email
        })
    except Exception as e:
        return Response({
            'error': f'Failed to send email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)