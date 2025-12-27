# backend/ads/views.py
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Pet, Favorite, PetImage, ViewHistory
from .serializers import PetSerializer, FavoriteSerializer
from .filters import PetFilter
from notifications.models import Notification


class PetViewSet(viewsets.ModelViewSet):
    serializer_class = PetSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PetFilter
    ordering_fields = ['created_at', 'price']
    ordering = ['-created_at']

    def get_queryset(self):
        user_id_param = self.request.query_params.get('user')
        if user_id_param is not None:
            try:
                user_id = int(user_id_param)
                return Pet.objects.filter(
                    user_id=user_id,
                    is_approved=True,
                    is_hidden=False,
                    is_active=True
                ).prefetch_related('images')
            except (TypeError, ValueError):
                return Pet.objects.none().prefetch_related('images')

        owner_filter = self.request.query_params.get('owner', None)
        if owner_filter == 'true':
            if self.request.user.is_authenticated:
                return Pet.objects.filter(user=self.request.user).prefetch_related('images')
            else:
                return Pet.objects.none().prefetch_related('images')

        if self.request.user.is_staff:
            return Pet.objects.all().prefetch_related('images')

        return Pet.objects.filter(
            is_approved=True,
            is_hidden=False,
            is_active=True
        ).prefetch_related('images')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        pet = serializer.save(user=self.request.user)
        images = self.request.FILES.getlist('images')
        for image in images:
            PetImage.objects.create(pet=pet, image=image)

    def perform_update(self, serializer):
        pet = serializer.save()
        images = self.request.FILES.getlist('images')
        if images:
            pet.images.all().delete()
            for image in images:
                PetImage.objects.create(pet=pet, image=image)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # 🔥 Статистика просмотров
        if not request.user.is_staff:
            if not instance.is_approved or instance.is_hidden:
                from django.http import Http404
                raise Http404()
            # Фиксируем просмотр
            ViewHistory.objects.create(
                pet=instance,
                ip_address=self.get_client_ip(request)
            )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    # 🔥 НОВОЕ: Управление объявлением
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def raise_ad(self, request, pk=None):
        pet = self.get_object()
        if pet.user != request.user:
            return Response({'error': 'Только владелец может управлять объявлением'}, status=status.HTTP_403_FORBIDDEN)
        if not pet.is_active:
            return Response({'error': 'Объявление снято с публикации'}, status=status.HTTP_400_BAD_REQUEST)
        if not pet.can_be_raised():
            return Response({
                'error': 'Можно поднять только раз в 7 дней',
                'next_raise_allowed_at': pet.get_next_raise_date().isoformat()
            }, status=status.HTTP_400_BAD_REQUEST)
        pet.last_raised_at = timezone.now()
        pet.save(update_fields=['last_raised_at'])
        return Response({'last_raised_at': pet.last_raised_at.isoformat()})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def deactivate(self, request, pk=None):
        pet = self.get_object()
        if pet.user != request.user:
            return Response({'error': 'Только владелец может управлять объявлением'}, status=status.HTTP_403_FORBIDDEN)
        pet.is_active = False
        pet.save(update_fields=['is_active'])
        return Response({'is_active': False})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def activate(self, request, pk=None):
        pet = self.get_object()
        if pet.user != request.user:
            return Response({'error': 'Только владелец может управлять объявлением'}, status=status.HTTP_403_FORBIDDEN)
        pet.is_active = True
        pet.last_raised_at = timezone.now()
        pet.save(update_fields=['is_active', 'last_raised_at'])
        return Response({'is_active': True})

    @action(detail=True, methods=['post', 'delete'], url_path='favorite')
    def favorite(self, request, pk=None):
        pet = get_object_or_404(Pet, pk=pk)
        user = request.user

        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == 'POST':
            favorite, created = Favorite.objects.get_or_create(user=user, pet=pet)
            if created and pet.user != user:
                Notification.objects.create(
                    recipient=pet.user,
                    actor=user,
                    verb='favorite',
                    description=f'Пользователь {user.username} добавил ваше объявление в избранное'
                )
            return Response({'is_favorite': True}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        elif request.method == 'DELETE':
            try:
                favorite = Favorite.objects.get(user=user, pet=pet)
                favorite.delete()
                return Response({'is_favorite': False}, status=status.HTTP_204_NO_CONTENT)
            except Favorite.DoesNotExist:
                return Response({'error': 'Not in favorites'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='similar')
    def similar_pets(self, request, pk=None):
        pet = get_object_or_404(Pet, pk=pk)
        if not pet.species or not pet.city:
            return Response([], status=status.HTTP_200_OK)
        similar = Pet.objects.filter(
            species=pet.species,
            city__iexact=pet.city,
            offer_type=pet.offer_type
        ).exclude(id=pet.id).prefetch_related('images')[:6]
        serializer = self.get_serializer(similar, many=True)
        return Response(serializer.data)



class FavoriteViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return Favorite.objects.filter(user=user).select_related('pet').prefetch_related('pet__images') if user.is_authenticated else Favorite.objects.none()


from rest_framework.permissions import IsAdminUser


class AdminPetModerationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = PetSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PetFilter
    ordering_fields = ['created_at', 'price']
    ordering = ['-created_at']

    def get_queryset(self):
        return Pet.objects.all().select_related('user').prefetch_related('images')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        pet = get_object_or_404(Pet, pk=pk)
        pet.is_approved = True
        pet.save(update_fields=['is_approved'])
        return Response({'is_approved': True})

    @action(detail=True, methods=['post'])
    def hide(self, request, pk=None):
        pet = get_object_or_404(Pet, pk=pk)
        pet.is_hidden = True
        pet.save(update_fields=['is_hidden'])
        return Response({'is_hidden': True})

    @action(detail=True, methods=['post'])
    def show(self, request, pk=None):
        pet = get_object_or_404(Pet, pk=pk)
        pet.is_hidden = False
        pet.save(update_fields=['is_hidden'])
        return Response({'is_hidden': False})

    @action(detail=True, methods=['post'])
    def delete(self, request, pk=None):
        pet = get_object_or_404(Pet, pk=pk)
        pet.is_active = False
        pet.save(update_fields=['is_active'])
        return Response({'is_active': False}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def get_categories(request):
    categories = [
        {"id": 1, "name": "Собаки", "icon": "🐶", "pet_count": 120},
        {"id": 2, "name": "Кошки", "icon": "🐱", "pet_count": 95},
        {"id": 3, "name": "Птицы", "icon": "🐦", "pet_count": 30},
        {"id": 4, "name": "Грызуны", "icon": "🐹", "pet_count": 25},
        {"id": 5, "name": "Рыбы", "icon": "🐠", "pet_count": 15},
        {"id": 6, "name": "Рептилии", "icon": "🦎", "pet_count": 10},
    ]
    return Response(categories)