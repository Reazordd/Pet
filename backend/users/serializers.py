# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from reviews.models import Review
from ads.models import Pet
from ads.serializers import PetSerializer
from .models import PhoneNumber

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    badges = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    pets = serializers.SerializerMethodField()

    # Поле phone только для записи
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'avatar', 'bio', 'location', 'date_joined',
            'is_trusted_seller', 'avito_delivery_count', 'is_company_verified',
            'badges', 'review_count', 'pets'
        ]
        read_only_fields = ['id', 'date_joined', 'badges', 'review_count']

    def to_representation(self, instance):
        """Добавляет номер телефона в ответ при GET"""
        data = super().to_representation(instance)
        try:
            data['phone'] = instance.phone_number.number
        except PhoneNumber.DoesNotExist:
            data['phone'] = None
        return data

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
        pets = self.context.get('prefetched_pets')
        if pets is not None:
            return PetSerializer(pets, many=True, context=self.context).data
        return PetSerializer(
            Pet.objects.filter(user=obj),
            many=True,
            context=self.context
        ).data

    def update(self, instance, validated_data):
        phone = validated_data.pop('phone', None)
        user = super().update(instance, validated_data)

        if phone is not None:
            if phone.strip() == "":
                PhoneNumber.objects.filter(user=user).delete()
            else:
                clean_phone = ''.join(c for c in phone if c.isdigit() or c == '+')
                if clean_phone.startswith('8'):
                    clean_phone = '+7' + clean_phone[1:]
                elif clean_phone and not clean_phone.startswith('+'):
                    clean_phone = '+' + clean_phone

                from django.core.exceptions import ValidationError
                from django.core.validators import RegexValidator
                phone_validator = RegexValidator(
                    regex=r'^\+?[379]\d{9,12}$',
                    message="Номер телефона должен быть в международном формате: +380991234567"
                )
                try:
                    phone_validator(clean_phone)
                    try:
                        PhoneNumber.objects.update_or_create(
                            user=user,
                            defaults={'number': clean_phone, 'verified': True}
                        )
                    except IntegrityError:
                        raise serializers.ValidationError({
                            'phone': 'Этот номер телефона уже используется другим аккаунтом.'
                        })
                except ValidationError as e:
                    raise serializers.ValidationError({'phone': str(e)})

        return user