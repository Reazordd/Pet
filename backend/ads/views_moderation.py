# backend/ads/views_moderation.py


from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Ad, Category
from .serializers import AdDetailSerializer, CategorySerializer
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
    queryset = Ad.objects.all().select_related("user", "category")
    serializer_class = AdDetailSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        ad = self.get_object()
        ad.is_active = True
        ad.save(update_fields=["is_active"])
        return Response({"status": "approved", "id": ad.id})

    @action(detail=True, methods=["post"])
    def hide(self, request, pk=None):
        ad = self.get_object()
        ad.is_active = False
        ad.save(update_fields=["is_active"])
        return Response({"status": "hidden", "id": ad.id})

    @action(detail=True, methods=["post"])
    def delete_item(self, request, pk=None):
        ad = self.get_object()
        ad.delete()
        return Response({"status": "deleted", "id": pk})

