# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from reviews.models import Review
from ads.models import Pet
from ads.serializers import PetSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    badges = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    pets = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'avatar', 'bio', 'location', 'date_joined',
            'is_trusted_seller', 'avito_delivery_count', 'is_company_verified',
            'badges', 'review_count', 'pets'
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
        return obj.received_reviews.count()

    def get_pets(self, obj):
        # 🔥 Получаем объявления из контекста (все, без фильтрации)
        pets = self.context.get('prefetched_pets')
        if pets is not None:
            return PetSerializer(pets, many=True, context=self.context).data
        # Fallback (на случай, если контекст не передан)
        return PetSerializer(
            Pet.objects.filter(user=obj),
            many=True,
            context=self.context
        ).data