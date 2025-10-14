from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_staff, name='register'),
    path('login/', views.staff_login, name='login'),
    path('info/', views.staff_info, name='info'),
]