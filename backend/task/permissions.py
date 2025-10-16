# task/permissions.py
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Admin can access everything"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_superuser)
        )

class IsStaff(permissions.BasePermission):
    """Staff has same permissions as admin"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'staff'

class IsAdminOrStaff(permissions.BasePermission):
    """Combined permission for Admin and Staff"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.role in ['admin', 'staff'] or request.user.is_superuser)
        )

class IsHOD(permissions.BasePermission):
    """HOD can only view department tasks"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'hod'
    
    def has_object_permission(self, request, view, obj):
        # For tasks, check if task is assigned to someone in HOD's department
        if hasattr(obj, 'assignments'):
            return obj.assignments.filter(department=request.user.department).exists()
        return False

class IsFaculty(permissions.BasePermission):
    """Faculty can only view their assigned tasks"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'faculty'
    
    def has_object_permission(self, request, view, obj):
        # For tasks, check if faculty is assigned to the task
        if hasattr(obj, 'assignments'):
            return obj.assignments.filter(assignee=request.user).exists()
        return False
