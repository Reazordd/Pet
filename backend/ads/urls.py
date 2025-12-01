# backend/ads/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()

# 🔥 Указываем basename, т.к. queryset динамический
router.register(r'pets', views.PetViewSet, basename='pet')
router.register(r'favorites', views.FavoriteViewSet, basename='favorite')

# 🔥 Новый роутер для модерации (только для админов)
moderation_router = DefaultRouter()
moderation_router.register(r'admin/pets', views.AdminPetModerationViewSet, basename='admin-pet')  # ✅ basename указан

urlpatterns = [
    # 🔥 Эндпоинт для получения категорий
    path('categories/', views.get_categories, name='categories'),
    # 🔥 Модерация объявлений (для админов)
    path('admin/', include(moderation_router.urls)),
]

urlpatterns += router.urls