from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'issued_by', 'assigned_to', 'deadline', 'status')
    list_filter = ('status', 'department', 'staff_hod')
    search_fields = ('title', 'description', 'department')
    readonly_fields = ('issued_on', 'last_edited_on', 'deadline_modification_history')
    date_hierarchy = 'deadline'
    
    fieldsets = (
        ('Task Information', {
            'fields': ('title', 'description', 'department', 'status')
        }),
        ('Assignment Details', {
            'fields': ('issued_by', 'assigned_to', 'staff_hod')
        }),
        ('Timeline', {
            'fields': ('issued_on', 'deadline')
        }),
        ('Modification History', {
            'fields': ('last_edited_by', 'last_edited_on', 'deadline_modification_history'),
            'classes': ('collapse',)
        })
    )