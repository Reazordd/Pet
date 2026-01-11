# backend/forum/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ForumCategory, ForumTopic, ForumComment
from .serializers import (
    ForumCategorySerializer,
    ForumTopicListSerializer,
    ForumTopicDetailSerializer,
    ForumCommentSerializer,
    MyForumActivitySerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    """Разрешение: только администратор может изменять/удалять/модерировать"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class ForumCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ForumCategory.objects.all().order_by("name")
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.AllowAny]

class ForumTopicViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ("list",):
            return ForumTopicListSerializer
        if self.action in ("retrieve",):
            return ForumTopicDetailSerializer
        return ForumTopicListSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return ForumTopic.objects.all()
        return ForumTopic.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, is_approved=self.request.user.is_staff)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        topic = get_object_or_404(ForumTopic, pk=pk)
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Требуется авторизация"}, status=status.HTTP_401_UNAUTHORIZED)
        if user in topic.likes.all():
            topic.likes.remove(user)
            return Response({"liked": False, "likes": topic.likes.count()})
        topic.likes.add(user)
        return Response({"liked": True, "likes": topic.likes.count()})

    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        topic = get_object_or_404(ForumTopic, pk=pk)
        comments = topic.comments.select_related("author").order_by("created_at")
        if not request.user.is_staff:
            comments = comments.filter(is_approved=True)
        serializer = ForumCommentSerializer(comments, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_comment(self, request, pk=None):
        topic = get_object_or_404(ForumTopic, pk=pk)
        text = request.data.get("text", "").strip()
        if not text:
            return Response({"detail": "Текст обязателен"}, status=status.HTTP_400_BAD_REQUEST)
        comment = ForumComment.objects.create(
            topic=topic,
            author=request.user,
            text=text,
            is_approved=request.user.is_staff,
        )
        serializer = ForumCommentSerializer(comment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ForumCommentViewSet(viewsets.ModelViewSet):
    queryset = ForumComment.objects.all()
    serializer_class = ForumCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ForumComment.objects.all()
        return ForumComment.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, is_approved=self.request.user.is_staff)

# 🔥 Главная страница форума
@api_view(['GET'])
def forum_home(request):
    topics = ForumTopic.objects.filter(is_approved=True).select_related('author', 'category').prefetch_related('comments')
    serializer = ForumTopicListSerializer(topics, many=True, context={'request': request})
    return Response(serializer.data)

# 🔥 Категории форума
@api_view(['GET'])
def get_categories(request):
    categories = ForumCategory.objects.all()
    serializer = ForumCategorySerializer(categories, many=True)
    return Response(serializer.data)