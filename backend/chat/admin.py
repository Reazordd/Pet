from django.contrib import admin
from .models import Chat, Message

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "updated_at")
    filter_horizontal = ("users",)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "sender", "created_at", "is_read")
    list_filter = ("is_read",)
    search_fields = ("text", "sender__username")
