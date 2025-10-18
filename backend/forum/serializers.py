from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ForumCategory, ForumTopic, ForumComment

User = get_user_model()


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "avatar"]


class ForumCategorySerializer(serializers.ModelSerializer):
    topics_count = serializers.IntegerField(source="topics.count", read_only=True)

    class Meta:
        model = ForumCategory
        fields = ["id", "name", "slug", "description", "topics_count"]


class ForumCommentSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = ForumComment
        fields = ["id", "author", "text", "likes_count", "created_at"]


class ForumTopicSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=ForumCategory.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    comments_count = serializers.IntegerField(source="comments.count", read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = ForumTopic
        fields = [
            "id",
            "title",
            "content",
            "author",
            "category",
            "category_id",
            "views",
            "likes_count",
            "comments_count",
            "created_at",
        ]
