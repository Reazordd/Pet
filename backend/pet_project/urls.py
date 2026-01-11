# backend/pet_project/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Токены
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Чат
    path('api/chat/', include('chat.urls')),

    # Основные модули
    path('api/', include('ads.urls')),
    path('api/', include('forum.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/history/', include('history.urls')),
    path('api/reviews/', include('reviews.urls')),

    # 🔥 ИСПРАВЛЕНО: пользователи теперь под /api/auth/
    path('api/auth/', include('users.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)