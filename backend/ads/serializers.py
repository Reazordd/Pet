# backend/ads/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Pet, PetImage, Favorite, ViewHistory

class PetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetImage
        fields = ['id', 'image', 'is_primary']

class PetSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    images = PetImageSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()
    can_be_raised = serializers.SerializerMethodField()
    next_raise_allowed_at = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = [
            'id', 'user', 'name', 'species', 'breed', 'birth_date',  # ← заменено
            'price', 'offer_type', 'city', 'description', 'images',
            'created_at', 'is_favorite', 'is_approved', 'is_hidden',
            'is_active', 'last_raised_at', 'can_be_raised', 'next_raise_allowed_at'
        ]
        read_only_fields = ['user', 'created_at', 'last_raised_at']

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_can_be_raised(self, obj):
        return obj.can_be_raised()

    def get_next_raise_allowed_at(self, obj):
        if not obj.can_be_raised():
            return obj.get_next_raise_date().isoformat()
        return None

class FavoriteSerializer(serializers.ModelSerializer):
    pet = PetSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'pet', 'created_at']
        read_only_fields = ['id', 'created_at']