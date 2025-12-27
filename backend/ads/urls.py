# backend/ads/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'pets', views.PetViewSet, basename='pet')
router.register(r'favorites', views.FavoriteViewSet, basename='favorite')

moderation_router = DefaultRouter()
moderation_router.register(r'pets', views.AdminPetModerationViewSet, basename='admin-pet')

urlpatterns = [
    path('categories/', views.get_categories, name='categories'),
    path('pets/<int:pet_id>/stats/', views.get_pet_view_stats, name='pet-stats'),
    path('admin/', include(moderation_router.urls)),
]

urlpatterns += router.urls