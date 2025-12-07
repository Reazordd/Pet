# backend/users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/<int:user_id>/', views.get_profile, name='get-profile'),
    path('profile/me/', views.get_my_profile, name='get-my-profile'),
    path('profile/me/update/', views.update_my_profile, name='update-my-profile'),
    path('profile/stats/', views.get_profile_stats, name='profile-stats'),
    path('chats/', views.get_user_chats, name='user-chats'),
]