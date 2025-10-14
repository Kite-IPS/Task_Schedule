from django.urls import path
from . import views

urlpatterns = [
	path('', views.all_tasks, name='all_tasks'),
]
