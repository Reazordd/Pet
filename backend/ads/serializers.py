from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Pet, Category

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    pet_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'created_at', 'pet_count']
        read_only_fields = ['id', 'slug', 'created_at', 'pet_count']

    def get_pet_count(self, obj):
        return obj.pet_set.count()


class PetSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_email = serializers.SerializerMethodField(read_only=True)
    user_phone = serializers.SerializerMethodField(read_only=True)

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Category.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Pet
        fields = [
            'id', 'user', 'user_email', 'user_phone',
            'category', 'category_id',
            'breed', 'name', 'age', 'description', 'price',
            'photo', 'is_active', 'views_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'views_count', 'created_at', 'updated_at']

    def get_user_email(self, obj):
        return obj.user.email if obj.user and obj.user.email else None

    def get_user_phone(self, obj):
        return obj.user.phone if obj.user and getattr(obj.user, 'phone', None) else None

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user is None or user.is_anonymous:
            raise serializers.ValidationError({"detail": "Authentication required to create a pet."})
        pet = Pet.objects.create(user=user, **validated_data)
        return pet

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
