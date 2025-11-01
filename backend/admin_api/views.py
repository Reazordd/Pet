# backend/admin_api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .serializers import AdminUserSerializer, AdminPetSerializer
from ads.models import Pet

User = get_user_model()

class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Админ: просмотр списка пользователей, блок/разблок.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all().order_by("-date_joined")

    @action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        user = self.get_object()
        if user.is_superuser:
            return Response({"detail": "Нельзя блокировать суперпользователя"}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"blocked": True})

    @action(detail=True, methods=["post"])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response({"blocked": False})

class AdminPetModerationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Админ: список объявлений + скрыть/показать + удалить (деактивировать).
    Использует существующее поле is_active у Pet для скрытия/модерации.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminPetSerializer
    queryset = Pet.objects.select_related("user", "category").all().order_by("-created_at")

    @action(detail=True, methods=["post"])
    def hide(self, request, pk=None):
        pet = self.get_object()
        pet.is_active = False
        pet.save(update_fields=["is_active"])
        return Response({"hidden": True})

    @action(detail=True, methods=["post"])
    def show(self, request, pk=None):
        pet = self.get_object()
        pet.is_active = True
        pet.save(update_fields=["is_active"])
        return Response({"hidden": False})

    @action(detail=True, methods=["post"])
    def delete_permanently(self, request, pk=None):
        pet = self.get_object()
        pet.delete()
        return Response({"deleted": True})
