# backend/pet_project/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# 🔥 Импортируем функции чата напрямую
from chat.views import create_chat, get_user_chats
from ads.views import get_categories

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('ads.urls')),
    path('api/', include('forum.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('history.urls')),
    path('api/', include('reviews.urls')),

    # 🔥 Чат — напрямую, без include('chat.urls')
    path('api/chat/create/', create_chat, name='create-chat'),
    path('api/chat/list/', get_user_chats, name='user-chats'),

    # JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Категории
    path('api/categories/', get_categories, name='categories'),
]