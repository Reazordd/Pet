from rest_framework.routers import DefaultRouter
from .views import ForumTopicViewSet, ForumCategoryViewSet, ForumModerationViewSet

router = DefaultRouter()
router.register("forum", ForumTopicViewSet, basename="forum")
router.register("forum-categories", ForumCategoryViewSet, basename="forum-category")
router.register("forum-moderation", ForumModerationViewSet, basename="forum-moderation")

urlpatterns = router.urls
