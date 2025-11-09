# backend/ads/views_moderation.py


from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Pet, Category
from .serializers import PetSerializer, CategorySerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

class AdsModerationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Админ-эндпоинты для модерации объявлений:
      - список всех объявлений (включая скрытые)
      - approve / hide / delete
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Pet.objects.all().select_related("user", "category")
    serializer_class = PetSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        pet = self.get_object()
        pet.is_active = True
        # если нужно — можно добавить поле is_approved отдельно
        if hasattr(pet, "is_approved"):
            pet.is_approved = True
        pet.save()
        return Response({"status": "approved", "id": pet.id})

    @action(detail=True, methods=["post"])
    def hide(self, request, pk=None):
        pet = self.get_object()
        pet.is_active = False
        pet.save()
        return Response({"status": "hidden", "id": pet.id})

    @action(detail=True, methods=["post"])
    def delete_item(self, request, pk=None):
        pet = self.get_object()
        pet.delete()
        return Response({"status": "deleted", "id": pk})
