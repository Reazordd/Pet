from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Pet, Category, Notification

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at', 'notification_type']
        read_only_fields = ['created_at']

class CategorySerializer(serializers.ModelSerializer):
    pet_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'pet_count']
        read_only_fields = ['created_at']

    def get_pet_count(self, obj):
        return obj.pet_set.count()

    def validate_name(self, value):
        if len(value) < 3:
            raise ValidationError("Название категории должно быть не менее 3 символов")
        return value

class PetSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Pet
        fields = [
            'id', 'user', 'user_email', 'user_phone', 'category', 'category_name',
            'breed', 'name', 'age', 'description', 'price', 'photo', 'created_at',
            'is_active', 'views_count'
        ]
        read_only_fields = ['created_at', 'user', 'views_count']

    def validate_price(self, value):
        if value is not None and value < 0:
            raise ValidationError("Цена не может быть отрицательной")
        return value

    def validate_age(self, value):
        if value < 0:
            raise ValidationError("Возраст не может быть отрицательным")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    pets_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'avatar', 'phone', 'address', 'date_joined', 'pets_count'
        ]
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_pets_count(self, obj):
        return obj.pet_set.count()

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'avatar', 'phone', 'address', 'date_joined'
        ]
        read_only_fields = ['date_joined']