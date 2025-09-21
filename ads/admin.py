# ads/admin.py
from django.contrib import admin
from .models import User, Pet, Category, Notification

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'phone', 'first_name', 'last_name']
    list_filter = ['is_staff', 'is_active']

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ['name', 'breed', 'age', 'price', 'user', 'created_at']
    list_filter = ['breed', 'category', 'created_at']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_short', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']

    def message_short(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message