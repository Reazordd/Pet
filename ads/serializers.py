# ads/serializers.py

from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Pet, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

    def validate_name(self, value):
        if len(value) < 3:
            raise ValidationError("Название категории должно быть не менее 3 символов")
        return value

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = [
            'id',
            'user',
            'category',
            'breed',
            'name',
            'age',
            'description',
            'price',
            'photo',
            'created_at'
        ]
        read_only_fields = ['created_at']

    def validate_price(self, value):
        if value < 0:
            raise ValidationError("Цена не может быть отрицательной")
        return value

    def validate_age(self, value):
        if value < 0:
            raise ValidationError("Возраст не может быть отрицательным")
        return value



