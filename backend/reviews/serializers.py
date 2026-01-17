# backend/reviews/serializers.py
from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer
from ads.serializers import PetSerializer

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewed = UserSerializer(read_only=True)  # ← добавлено
    pet = PetSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewed', 'pet', 'rating', 'comment', 'created_at', 'transaction_completed']
        read_only_fields = ['id', 'reviewer', 'reviewed', 'pet', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Оценка должна быть от 1 до 5")
        return value