# backend/users/views_admin.py


from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

class UserAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=["post"])
    def ban(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"status": "banned", "id": user.id})

    @action(detail=True, methods=["post"])
    def unban(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({"status": "unbanned", "id": user.id})

    @action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = True
        user.save()
        return Response({"status": "blocked", "id": user.id})

    @action(detail=True, methods=["post"])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = False
        user.save()
        return Response({"status": "unblocked", "id": user.id})
