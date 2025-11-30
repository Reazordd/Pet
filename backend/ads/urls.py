# backend/ads/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()

# 🔥 Указываем basename, т.к. queryset динамический
router.register(r'pets', views.PetViewSet, basename='pet')
router.register(r'favorites', views.FavoriteViewSet, basename='favorite')

urlpatterns = [
    # 🔥 Эндпоинт для получения категорий
    path('categories/', views.get_categories, name='categories'),
]

urlpatterns += router.urls