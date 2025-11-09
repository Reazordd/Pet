# backend/admin_api/serializers.py


from rest_framework import serializers
from django.contrib.auth import get_user_model
from ads.models import Pet

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "is_active",
            "first_name", "last_name", "phone", "avatar", "date_joined"
        ]
        read_only_fields = ["id", "date_joined"]

class AdminPetSerializer(serializers.ModelSerializer):
    user = AdminUserSerializer(read_only=True)
    category = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = [
            "id", "user", "category", "name", "breed",
            "age", "price", "is_active", "views_count",
            "created_at", "updated_at", "description", "photo"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "views_count"]

    def get_category(self, obj):
        if obj.category:
            return {"id": obj.category.id, "name": obj.category.name}
        return None
