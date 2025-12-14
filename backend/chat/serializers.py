# backend/chat/serializers.py
from rest_framework import serializers
from .models import Chat, Message

class MessageSerializer(serializers.ModelSerializer):
    is_own = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'content', 'created_at', 'is_own']
        read_only_fields = ['id', 'created_at', 'is_own']

    def get_is_own(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender_id == request.user.id
        return False

    def create(self, validated_data):
        # chat и sender подставляются из вьюхи
        return super().create(validated_data)


class ChatSerializer(serializers.ModelSerializer):
    from users.serializers import UserSerializer  # Локальный импорт — предотвращает цикл
    users = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    current_user_id = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'users', 'messages', 'created_at', 'current_user_id']
        read_only_fields = ['id', 'created_at']

    def get_current_user_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.id
        return None