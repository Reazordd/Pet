from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Pet, Category, Favorite, Notification
from .serializers import PetSerializer, CategorySerializer, FavoriteSerializer, NotificationSerializer
from .filters import PetFilter
from .pagination import StandardResultsSetPagination


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all()
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PetFilter
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        pet = serializer.save(user=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            message=f"Ваше объявление '{pet.name}' успешно опубликовано!",
            notification_type='success'
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def increment_views(self, request, pk=None):
        pet = self.get_object()
        pet.increment_views()
        return Response({'views_count': pet.views_count})


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('pet')

    @action(detail=False, methods=['post'], url_path='add/(?P<pet_id>[^/.]+)')
    def add(self, request, pet_id=None):
        pet = Pet.objects.filter(id=pet_id).first()
        if not pet:
            return Response({'error': 'Питомец не найден'}, status=status.HTTP_404_NOT_FOUND)
        favorite, created = Favorite.objects.get_or_create(user=request.user, pet=pet)
        if not created:
            return Response({'detail': 'Уже в избранном'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Добавлено в избранное'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='remove/(?P<pet_id>[^/.]+)')
    def remove(self, request, pet_id=None):
        deleted, _ = Favorite.objects.filter(user=request.user, pet_id=pet_id).delete()
        if deleted:
            return Response({'detail': 'Удалено из избранного'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
