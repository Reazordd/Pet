from rest_framework.routers import DefaultRouter
from .views import ForumTopicViewSet, ForumCategoryViewSet

router = DefaultRouter()
router.register("forum", ForumTopicViewSet, basename="forum")
router.register("forum-categories", ForumCategoryViewSet, basename="forum-category")

urlpatterns = router.urls
