from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Pet, Category

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    pet_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "description", "pet_count"]

    def get_pet_count(self, obj):
        return obj.pet_set.filter(is_active=True).count()


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "avatar"]


class PetSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Pet
        fields = [
            "id", "user", "category", "category_id",
            "name", "breed", "age", "description", "price",
            "photo", "is_active", "views_count",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "user", "views_count", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or user.is_anonymous:
            raise serializers.ValidationError({"detail": "Авторизация обязательна"})
        return Pet.objects.create(user=user, **validated_data)
