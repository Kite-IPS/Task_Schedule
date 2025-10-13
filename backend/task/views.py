from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Staff
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from functools import wraps

def generate_token(staff):
    """Generate JWT token for staff"""
    payload = {
        'staff_id': staff.id,
        'email': staff.email,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(request, *args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Token is missing'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            staff = Staff.objects.get(id=payload['staff_id'])
            request.staff = staff
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except (jwt.InvalidTokenError, Staff.DoesNotExist):
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return f(request, *args, **kwargs)
    return decorated

@api_view(['POST'])
def register_staff(request):
    data = request.data
    
    # Validate required fields
    required_fields = ['name', 'email', 'password', 'department']
    for field in required_fields:
        if not data.get(field):
            return Response({
                'error': f'{field} is required'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if Staff.objects.filter(email=data['email']).exists():
        return Response({
            'error': 'Email already registered'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create staff member with hashed password
    staff = Staff.objects.create(
        name=data['name'],
        email=data['email'],
        department=data['department'],
        password=make_password(data['password'])
    )
    
    return Response({
        'message': 'Staff registered successfully',
        'staff_id': staff.id
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def staff_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': 'Please provide both email and password'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        staff = Staff.objects.get(email=email)
    except Staff.DoesNotExist:
        return Response({
            'error': 'Staff not found'
        }, status=status.HTTP_404_NOT_FOUND)

    if not check_password(password, staff.password):
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

    token = generate_token(staff)
    
    return Response({
        'token': token,
        'staff': {
            'id': staff.id,
            'name': staff.name,
            'email': staff.email,
            'department': staff.department,
            'role': staff.role
        }
    })

@api_view(['GET'])
@token_required
def staff_info(request):
    staff = request.staff
    return Response({
        'id': staff.id,
        'name': staff.name,
        'email': staff.email,
        'department': staff.department,
        'role': staff.role
    })
