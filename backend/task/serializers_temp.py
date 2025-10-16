# task/serializers.py
from rest_framework import serializers
from .models import Task, TaskAssignment, TaskHistory, TaskAttachment
from staff.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()
    assignee = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'department', 'assignee',
            'priority', 'status', 'due_date', 'created_by', 'created_at', 
            'completed_at'
        ]
    
    def get_department(self, obj):
        departments = obj.assignments.values_list('department', flat=True).distinct()
        return list(departments)
    
    def get_assignee(self, obj):
        assignments = obj.assignments.select_related('assignee').all()
        return [{
            'email': assignment.assignee.email,
            'full_name': assignment.assignee.get_full_name(),
            'department': assignment.department
        } for assignment in assignments]