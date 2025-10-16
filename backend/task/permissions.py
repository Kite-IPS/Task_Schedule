# task/permissions.py
from rest_framework import permissions

class RoleBasedPermission(permissions.BasePermission):
    """
    Check if user has required role.
    Usage in views: 
        @permission_classes([IsAuthenticated, RoleBasedPermission])
        And add: required_roles = ['admin', 'hod'] in the view
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Superuser always has access
        if request.user.is_superuser:
            return True
        
        # Check if view has required_roles attribute
        required_roles = getattr(view, 'required_roles', None)
        
        if required_roles is None:
            return True  # No role restriction
        
        return request.user.role in required_roles

class IsAdmin(permissions.BasePermission):
    """Admin can access everything"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_superuser)
        )


class IsHOD(permissions.BasePermission):
    """HOD can access department-specific data"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'hod'


class IsStaff(permissions.BasePermission):
    """Staff can access their assigned tasks and create new tasks"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'staff'


class IsTaskCreator(permissions.BasePermission):
    """Only Admin and Staff can create tasks"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.role in ['admin', 'staff'] or
            request.user.is_superuser)
        )
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'staff'


class IsAdminOrHOD(permissions.BasePermission):
    """Admin or HOD can create tasks"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.role in ['admin', 'hod'] or request.user.is_superuser)
        )
