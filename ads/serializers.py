# ads/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Pet, Category, User

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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'avatar', 'phone', 'address']
        read_only_fields = ['id']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name',
                  'avatar', 'phone', 'address']