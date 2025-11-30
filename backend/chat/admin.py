# backend/chat/admin.py
from django.contrib import admin
from .models import Chat, Message

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('users__username', 'users__email')
    readonly_fields = ('created_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'content', 'created_at')  # ✅ было: 'timestamp'
    list_filter = ('created_at',)  # ✅ было: 'timestamp'
    search_fields = ('content', 'sender__username')
    readonly_fields = ('created_at',)  # ✅ было: 'timestamp'
    ordering = ('-created_at',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('chat', 'sender')