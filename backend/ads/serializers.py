# backend/ads/serializers.py
from rest_framework import serializers
from .models import Pet, PetImage, Favorite

class PetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetImage
        fields = ['id', 'image', 'is_primary']

class PetSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    images = PetImageSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = [
            'id', 'user', 'name', 'species', 'breed', 'age', 'price',
            'offer_type', 'city', 'description', 'images',
            'created_at', 'is_favorite', 'is_approved', 'is_hidden'
        ]
        read_only_fields = ['user', 'created_at']

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

# ❌ УДАЛЕНЫ create и update — они мешают работе с файлами

class FavoriteSerializer(serializers.ModelSerializer):
    pet = PetSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'pet', 'created_at']
        read_only_fields = ['id', 'created_at']