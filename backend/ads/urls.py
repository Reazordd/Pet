# backend/ads/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'pets', views.PetViewSet, basename='pet')
router.register(r'favorites', views.FavoriteViewSet, basename='favorite')

urlpatterns = [
    # 🔥 НОВЫЙ МАРШРУТ
    path('rss/', views.pets_rss_feed, name='pets-rss'),

    path('categories/', views.get_categories, name='categories'),
    path('pets/<int:pet_id>/stats/', views.get_pet_view_stats, name='pet-stats'),
    path('breeds/', views.get_breeds, name='breeds'),
    path('city/<str:city_slug>/', views.get_city_pets, name='city-pets'),
    path('city/<str:city_slug>/<str:species>/', views.get_city_pets, name='city-pets-species'),
]

urlpatterns += router.urls