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

class TaskDetailSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()
    assignee = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'department', 'assignee',
            'priority', 'status', 'due_date', 'created_by', 'created_at',
            'completed_at', 'reminder1', 'reminder2', 'history', 'attachments'
        ]
    
    def get_department(self, obj):
        return list(obj.assignments.values_list('department', flat=True).distinct())
    
    def get_assignee(self, obj):
        return list(obj.assignments.values_list('assignee__email', flat=True))
    
    def get_history(self, obj):
        history = obj.history.select_related('performed_by')[:10]
        return [{
            'action': h.action,
            'performed_by': h.performed_by.get_full_name() if h.performed_by else None,
            'timestamp': h.timestamp,
            'details': h.details
        } for h in history]
    
    def get_attachments(self, obj):
        return [{
            'id': att.id,
            'file_name': att.file_name,
            'file_url': att.file.url,
            'uploaded_by': att.uploaded_by.get_full_name(),
            'uploaded_at': att.uploaded_at
        } for att in obj.attachments.all()]

class TaskCreateSerializer(serializers.ModelSerializer):
    department = serializers.ListField(child=serializers.CharField())
    assignee = serializers.ListField(child=serializers.EmailField())
    attachment = serializers.FileField(required=False, allow_null=True)
    created_by = serializers.CharField(required=True, max_length=255,
                                     help_text="Name of the person who requested this task")
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'department', 'assignee',
            'priority', 'status', 'due_date', 'attachment',
            'created_by'
        ]
    
    def validate_department(self, value):
        """Validate departments"""
        from staff.models import User
        valid_departments = dict(User.DEPARTMENT_CHOICES).keys()
        
        for dept in value:
            if dept not in valid_departments:
                raise serializers.ValidationError(
                    f"Invalid department '{dept}'"
                )
        return value
        
    def create(self, validated_data):
        """Create task with multiple assignments"""
        from staff.models import User
        
        # Pop assignment data
        assignees = validated_data.pop('assignee')
        departments = validated_data.pop('department')
        attachment = validated_data.pop('attachment', None)
        
        # Create task with other fields including created_by
        task = Task.objects.create(**validated_data)
        
        # Create assignments
        assignments = []
        for email in assignees:
            assignee = User.objects.get(email=email)
            assignment = TaskAssignment(
                task=task,
                assignee=assignee,
                department=assignee.department or 'GENERAL'  # Fallback to GENERAL
            )
            assignments.append(assignment)
        
        # Bulk create assignments
        TaskAssignment.objects.bulk_create(assignments)
        
        # Record creation history
        TaskHistory.objects.create(
            task=task,
            action='created',
            performed_by=self.context['request'].user,
            details={'departments': departments, 'assignees': assignees}
        )
        
        # Handle attachment if provided
        if attachment:
            TaskAttachment.objects.create(
                task=task,
                file=attachment,
                uploaded_by=self.context['request'].user,
                file_name=attachment.name
            )
        
        return task