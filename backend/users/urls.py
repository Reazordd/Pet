#backend/users/urls.py

from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from . import views
from .views_admin import UserAdminViewSet
from .views_password import PasswordResetRequestView, PasswordResetConfirmView

router = DefaultRouter()
router.register("admin-users", UserAdminViewSet, basename="admin-users")

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("profile/stats/", views.ProfileStatsView.as_view(), name="profile-stats"),
    path("profile/dashboard/", views.DashboardView.as_view(), name="profile-dashboard"),
    path("profile/my-forum/", views.MyForumView.as_view(), name="profile-forum"),
    path("", include(router.urls)),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("admin/dashboard/", views.AdminDashboardView.as_view(), name="admin-dashboard"),


    # JWT Auth endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
