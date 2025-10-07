from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import PetViewSet, CategoryViewSet, FavoriteViewSet, NotificationViewSet

router = DefaultRouter()
router.register('pets', PetViewSet)
router.register('categories', CategoryViewSet)
router.register('favorites', FavoriteViewSet, basename='favorites')
router.register('notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]
