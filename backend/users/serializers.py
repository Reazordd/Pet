# backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from ads.models import Pet
from forum.models import ForumTopic

User = get_user_model()


# --- Регистрация и профиль ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'bio', 'location'
        )

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Пароли не совпадают"})
        validate_password(data.get('password'))
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'bio', 'location', 'avatar',
            'email_verified', 'phone_verified', 'is_active', 'is_staff'
        )
        read_only_fields = ('email_verified', 'phone_verified', 'is_staff')


# --- Короткая версия пользователя (для списков, форума и т.д.) ---
class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar']


# --- Dashboard для администратора ---
class DashboardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    blocked_users = serializers.IntegerField()
    total_ads = serializers.IntegerField()
    active_ads = serializers.IntegerField()
    hidden_ads = serializers.IntegerField()
    total_forum_topics = serializers.IntegerField()
    new_users = UserSerializer(many=True)
