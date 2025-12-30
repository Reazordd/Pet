# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from reviews.models import Review  # ← импорт модели отзывов

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    badges = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()  # ← новое поле

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'avatar', 'bio', 'location', 'date_joined',
            'is_trusted_seller', 'avito_delivery_count', 'is_company_verified',
            'badges', 'review_count'  # ← добавлено в список
        ]
        read_only_fields = ['id', 'date_joined', 'badges', 'review_count']

    def get_badges(self, obj):
        badges = []
        if obj.is_trusted_seller:
            badges.append({
                "title": "Надёжный продавец",
                "bgColor": "#E6F6FF",
                "textColor": "#0071F0"
            })
        if obj.avito_delivery_count > 0:
            badges.append({
                "title": f"{obj.avito_delivery_count} покупок на PetMarket",
                "bgColor": "#FFF8E6",
                "textColor": "#FFA800"
            })
        if obj.is_company_verified:
            badges.append({
                "title": "Компания проверена",
                "bgColor": "#E8F5E9",
                "textColor": "#2E7D32"
            })
        return badges

    def get_review_count(self, obj):
        # Возвращаем количество полученных отзывов
        return obj.received_reviews.count()