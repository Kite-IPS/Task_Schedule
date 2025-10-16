# staff/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer
from task.permissions import IsAdmin
from task.permissions import RoleBasedPermission

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_view(request):
    """Login endpoint with JWT token generation using email"""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = authenticate(
        request,
        username=serializer.validated_data['email'],  # Django uses 'username' param
        password=serializer.validated_data['password']
    )
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'staff': UserSerializer(user).data
        })
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info_view(request):
    """Get current user information"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, RoleBasedPermission])
def get_all_users(request):
    """Admin: Get all users"""
    # if request.user.role != 'admin' and not request.user.is_superuser:
    #     return Response({'error': 'Admin access required'}, status=403)
    
    users = User.objects.all().order_by('role', 'department')
    serializer = UserSerializer(users, many=True)
    return Response({'users': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def create_user(request):
    """Admin: Create new user"""
    serializer = UserCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(
        UserSerializer(user).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_user(request, user_id):
    """Admin: Update user"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if 'name' in request.data:
        name_parts = request.data['name'].split(' ', 1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
    
    if 'role' in request.data:
        user.role = request.data['role']
    
    if 'department' in request.data:
        user.department = request.data['department']
    
    if 'email' in request.data:
        user.email = request.data['email']
    
    user.save()
    return Response(UserSerializer(user).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_user(request, user_id):
    """Admin: Delete user"""
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )