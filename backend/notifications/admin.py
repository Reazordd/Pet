# backend/notifications/admin.py
from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'recipient', 'verb', 'short_description', 'is_read', 'created_at']
    list_filter = ['verb', 'is_read', 'created_at', 'recipient']
    search_fields = ['recipient__username', 'actor__username', 'description']
    readonly_fields = ['created_at']

    def short_description(self, obj):
        return (obj.description[:50] + '...') if len(obj.description) > 50 else obj.description
    short_description.short_description = 'Описание'