from django.contrib import admin
from .models import Staff

class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'department')
    search_fields = ('name', 'email', 'department')
  
admin.site.register(Staff, StaffAdmin)