# task/serializers.py
from rest_framework import serializers
from .models import Task, TaskAssignment, TaskHistory, TaskAttachment
from staff.serializers import UserSerializer

class TaskHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()
    task_title = serializers.SerializerMethodField()
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = TaskHistory
        fields = ['id', 'task', 'task_title', 'action', 'action_display', 
                  'performed_by_name', 'timestamp', 'details']
    
    def get_performed_by_name(self, obj):
        return obj.performed_by.get_full_name() if obj.performed_by else 'System'
    
    def get_task_title(self, obj):
        return obj.task.title if obj.task else 'Unknown Task'

class TaskSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()
    assignee = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'department', 'assignee',
            'priority', 'status', 'due_date', 'created_at', 'completed_at'
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
    created_by = UserSerializer(read_only=True)
    department = serializers.SerializerMethodField()
    assignee = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'department', 'assignee',
            'priority', 'status', 'due_date', 'created_by', 'created_at',
            'history', 'attachments'
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

# task/serializers.py
class TaskCreateSerializer(serializers.ModelSerializer):
    department = serializers.ListField(child=serializers.CharField())
    assignee = serializers.ListField(child=serializers.EmailField())
    attachment = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'department', 'assignee',
            'priority', 'status', 'due_date', 'attachment'
        ]
    
    def validate_assignee(self, value):
        """Validate that all assignees exist as emails"""
        from staff.models import User
        
        for email in value:
            if not User.objects.filter(email=email).exists():
                raise serializers.ValidationError(
                    f"User with email '{email}' does not exist"
                )
        
        return value
    
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
        departments = validated_data.pop('department', [])  # Optional now
        
        # Create task
        task = Task.objects.create(**validated_data)
        
        # Create assignments - one per assignee using their own department
        assignments = []
        for email in assignees:
            assignee = User.objects.get(email=email)
            # Use the user's own department from their profile
            # This respects the unique_together constraint (task, assignee)
            assignment = TaskAssignment(
                task=task,
                assignee=assignee,
                department=assignee.department or 'GENERAL'  # Fallback to GENERAL
            )
            assignments.append(assignment)
        
        # Bulk create assignments
        TaskAssignment.objects.bulk_create(assignments)
        
        return task
    
    def validate(self, data):
        """Cross-field validation: check assignees belong to departments"""
        from staff.models import User
        
        departments = data.get('department', [])
        assignees = data.get('assignee', [])
        
        for email in assignees:
            user = User.objects.filter(email=email).first()
            if user and user.department not in departments:
                raise serializers.ValidationError({
                    'assignee': f"User '{email}' does not belong to any of the specified departments ({user.department})"
                })
        
        return data
    
    def create(self, validated_data):
        departments = validated_data.pop('department')
        assignees = validated_data.pop('assignee')
        attachment = validated_data.pop('attachment', None)
        
        # Create task
        task = Task.objects.create(**validated_data)
        
        # Create assignments
        from staff.models import User
        for email in assignees:
            user = User.objects.get(email=email)
            for dept in departments:
                if user.department == dept:
                    TaskAssignment.objects.create(
                        task=task,
                        assignee=user,
                        department=dept
                    )
        
        # Create history entry
        TaskHistory.objects.create(
            task=task,
            action='created',
            performed_by=self.context['request'].user,
            details={'departments': departments, 'assignees': assignees}
        )
        
        # Handle attachment
        if attachment:
            TaskAttachment.objects.create(
                task=task,
                file=attachment,
                uploaded_by=self.context['request'].user,
                file_name=attachment.name,
                file_size=attachment.size
            )
        
        return task