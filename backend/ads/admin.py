from django.contrib import admin
from .models import Pet, Category, Notification


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ['name', 'breed', 'price', 'user', 'is_active', 'created_at']
    list_display_links = ['name']
    list_filter = ['is_active', 'category']
    search_fields = ['name', 'description', 'user__username', 'breed']
    readonly_fields = ['views_count', 'created_at', 'updated_at']
    list_editable = ['price', 'is_active']
    ordering = ['-created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_short', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']
    search_fields = ['message', 'user__username']
    readonly_fields = ['created_at']

    def message_short(self, obj):
        return (obj.message[:50] + '...') if len(obj.message) > 50 else obj.message

    message_short.short_description = 'Сообщение'
