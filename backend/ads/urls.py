#backend/ads/urls.py

from rest_framework.routers import DefaultRouter
from .views import PetViewSet, CategoryViewSet
from .views_moderation import AdsModerationViewSet

router = DefaultRouter()
router.register(r'pets', PetViewSet, basename='pets')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register("ads-moderation", AdsModerationViewSet, basename="ads-moderation")

urlpatterns = router.urls
