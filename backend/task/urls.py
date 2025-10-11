from django.urls import path
from . import views

urlpatterns = [
    path('staff/register/', views.register_staff, name='register-staff'),
    path('staff/login/', views.staff_login, name='staff-login'),
    path('staff/info/', views.staff_info, name='staff-info'),
]