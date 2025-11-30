# backend/forum/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ForumCategory, ForumTopic, ForumComment

User = get_user_model()

class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "avatar"]

class ForumCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumCategory
        fields = ["id", "name", "slug", "description", "is_active"]

class ForumCommentSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)

    class Meta:
        model = ForumComment
        fields = ["id", "topic", "author", "text", "is_approved", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

class ForumTopicListSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = ForumTopic
        fields = [
            "id", "title", "content", "author", "category",
            "likes_count", "is_approved", "is_pinned", "created_at",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

class ForumTopicDetailSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    comments = ForumCommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = ForumTopic
        fields = [
            "id", "title", "content", "author", "category",
            "likes_count", "comments", "is_approved", "is_pinned", "created_at",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

# --- Упрощённые сериализаторы для "моя активность" в личном кабинете ---
class MyForumActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumTopic
        fields = ["id", "title", "created_at", "is_approved", "is_pinned"]