# backend/chat/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'chats', views.ChatViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
    # 🔥 Эндпоинт для создания чата
    path('create/', views.create_chat, name='create-chat'),
    path('list/', views.get_user_chats, name='user-chats'),
]