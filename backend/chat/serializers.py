# backend/chat/serializers.py
from rest_framework import serializers
from .models import Chat, Message

class MessageSerializer(serializers.ModelSerializer):
    is_own = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'content', 'file_url', 'created_at', 'is_own']
        read_only_fields = ['id', 'created_at', 'is_own', 'file_url']

    def get_is_own(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.sender_id == request.user.id
        return False

    def get_file_url(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            return obj.file.url
        return None


class ChatSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'other_user', 'last_message_preview', 'last_message_time']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        user = request.user
        other = next((u for u in obj.users.all() if u.id != user.id), None)
        if not other:
            return None

        # 🔥 Безопасное получение аватара — без ошибки, если нет profile
        avatar_url = None
        if hasattr(other, 'avatar') and other.avatar:  # ← User имеет avatar напрямую!
            avatar_url = other.avatar.url

        return {
            'id': other.id,
            'username': other.username,
            'avatar': avatar_url
        }

    def get_last_message_preview(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            if last_msg.content:
                return last_msg.content
            if last_msg.file:
                return '[Фото]'
        return None

    def get_last_message_time(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        return last_msg.created_at.isoformat() if last_msg else None