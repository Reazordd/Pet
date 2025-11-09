#backend/forum/urls.py

from rest_framework.routers import DefaultRouter
from .views import ForumCategoryViewSet, ForumTopicViewSet, ForumCommentModerationViewSet
from django.urls import path, include

router = DefaultRouter()
router.register("forum/categories", ForumCategoryViewSet, basename="forum-category")
router.register("forum/topics", ForumTopicViewSet, basename="forum-topic")
router.register("forum/comments/moderation", ForumCommentModerationViewSet, basename="forum-comments-moderation")

# 🔹 Добавим эндпоинт для админской модерации форума
from django.urls import path
from .views import ForumModerationViewSet

urlpatterns = router.urls + [
    path("admin/forum/moderation/", ForumModerationViewSet.as_view({"get": "list"}), name="forum-moderation"),
    path("admin/forum/moderation/<int:pk>/approve/", ForumModerationViewSet.as_view({"post": "approve"})),
    path("admin/forum/moderation/<int:pk>/delete/", ForumModerationViewSet.as_view({"post": "delete"})),
    path("", include(router.urls)),
]
