from rest_framework.routers import DefaultRouter
from .views import PetViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'pets', PetViewSet, basename='pets')
router.register(r'categories', CategoryViewSet, basename='categories')

urlpatterns = router.urls
