from rest_framework import serializers
from .models import Pet, Category, Favorite, Notification


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'created_at']


class PetSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Category.objects.all(),
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Pet
        fields = '__all__'
        read_only_fields = ['id', 'user', 'views_count', 'created_at', 'updated_at']


class FavoriteSerializer(serializers.ModelSerializer):
    pet = PetSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'pet', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'notification_type', 'is_read', 'created_at', 'link']
