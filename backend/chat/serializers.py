# backend/chat/serializers.py
from rest_framework import serializers
from .models import Chat, Message
from users.serializers import UserSerializer  # 🔥 Убедитесь, что он не вызывает цикл

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'content', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['sender'] = request.user
        return super().create(validated_data)

class ChatSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'users', 'messages', 'created_at']
        read_only_fields = ['id', 'created_at']