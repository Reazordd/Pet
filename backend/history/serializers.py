# backend/history/serializers.py
from rest_framework import serializers
from .models import ViewHistory
from ads.serializers import PetSerializer  # Убедитесь, что он возвращает фото

class ViewHistorySerializer(serializers.ModelSerializer):
    pet = PetSerializer(read_only=True)

    class Meta:
        model = ViewHistory
        fields = ['id', 'pet', 'viewed_at']
        read_only_fields = ['id', 'pet', 'viewed_at']