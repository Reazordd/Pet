# backend/notifications/serializers.py
from rest_framework import serializers
from .models import Notification
from users.serializers import UserSerializer  # Убедитесь, что нет циклического импорта

class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'description', 'is_read', 'created_at']
        read_only_fields = ['id', 'actor', 'created_at']