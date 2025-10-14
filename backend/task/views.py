from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Task


@api_view(['GET'])
def all_tasks(request):
	"""Return all tasks with selected fields: title, description, department, status, assignee, priority, due-date

	Note: The Task model doesn't currently have an explicit `priority` field; if absent we return `null`.
	"""
	tasks = Task.objects.all()
	result = []
	for t in tasks:
		result.append({
			'id': t.id,
			'title': t.title,
			'description': t.description,
			'department': t.department,
			'status': t.status,
            'priority': t.priority if hasattr(t, 'priority') else None,
			'assignee': {
				'id': t.assigned_to.id,
				'name': t.assigned_to.name,
				'email': t.assigned_to.email,
			} if t.assigned_to else None,
			'due_date': t.deadline.isoformat() if t.deadline else None,
            'created_by': {
                'id': t.issued_by.id,
                'name': t.issued_by.name,
                'email': t.issued_by.email,
            } if t.issued_by else None,
		})

	return Response(result, status=status.HTTP_200_OK)