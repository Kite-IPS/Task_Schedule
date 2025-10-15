# staff/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'department']
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email


class UserCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['name', 'email', 'role', 'department', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        name = validated_data.pop('name', '')
        name_parts = name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            role=validated_data['role'],
            department=validated_data.get('department')
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)