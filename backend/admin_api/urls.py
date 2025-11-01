# backend/admin_api/urls.py
from rest_framework.routers import DefaultRouter
from .views import AdminUserViewSet, AdminPetModerationViewSet

router = DefaultRouter()
router.register("users", AdminUserViewSet, basename="admin-users")
router.register("pets", AdminPetModerationViewSet, basename="admin-pets")

urlpatterns = router.urls
