# backend/ads/views.py
from django.http import Http404
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from .models import Pet, Favorite, PetImage
from history.models import ViewHistory
from .serializers import PetSerializer, FavoriteSerializer
from .filters import PetFilter
from notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

BAN_WORDS = ['дешево', 'скидка', 'телефон', 'в лс', 'whatsapp', 'телеграм', 'номер', 'звонить', 'лс']


class PetViewSet(viewsets.ModelViewSet):
    serializer_class = PetSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PetFilter
    ordering_fields = ['created_at', 'price']
    ordering = ['-created_at']

    def get_queryset(self):
        # 🔥 1. Для retrieve — возвращаем ВСЕ объявления
        if self.action == 'retrieve':
            return Pet.objects.prefetch_related('images')

        # 🔥 2. Для "Мои объявления": ?owner=true → ТОЛЬКО СВОИ
        owner_filter = self.request.query_params.get('owner')
        if owner_filter == 'true':
            if self.request.user.is_authenticated:
                return Pet.objects.filter(
                    user=self.request.user,
                    moderation_status='approved',
                    is_active=True
                ).prefetch_related('images')
            else:
                return Pet.objects.none().prefetch_related('images')

        # 🔥 3. Для профиля другого пользователя: ?user=ID
        if 'user' in self.request.query_params:
            try:
                user_id = int(self.request.query_params['user'])
                return Pet.objects.filter(
                    user_id=user_id,
                    moderation_status='approved',
                    is_active=True
                ).prefetch_related('images')
            except (TypeError, ValueError):
                return Pet.objects.none().prefetch_related('images')

        # 🔥 4. Для общего списка (/pets/) — только одобренные
        base_q = Pet.objects.prefetch_related('images')

        if self.request.user.is_staff:
            return base_q

        return base_q.filter(
            moderation_status='approved',
            is_active=True
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        pet = serializer.save(
            user=self.request.user,
            moderation_status='pending'  # всегда на модерацию
        )
        images = self.request.FILES.getlist('images')
        for image in images:
            PetImage.objects.create(pet=pet, image=image)

        # Автоматическая модерация
        self.auto_moderate(pet)
        if pet.moderation_status == 'pending':
            self.notify_moderators(pet)

    def perform_update(self, serializer):
        pet = serializer.save()
        images = self.request.FILES.getlist('images')
        if images:
            pet.images.all().delete()
            for image in images:
                PetImage.objects.create(pet=pet, image=image)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Публичный доступ: только одобренные и активные
        if instance.moderation_status == 'approved' and instance.is_active:
            if request.user.is_authenticated and request.user != instance.user:
                ViewHistory.objects.get_or_create(user=request.user, pet=instance)
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        # Приватный доступ: владелец и модератор
        if request.user == instance.user or request.user.is_staff:
            if request.user.is_authenticated and request.user != instance.user:
                ViewHistory.objects.get_or_create(user=request.user, pet=instance)
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        # Иначе — 404
        raise Http404()

    def auto_moderate(self, pet):
        text = f"{pet.name or ''} {pet.description or ''}".lower()
        for word in BAN_WORDS:
            if word in text:
                pet.moderation_status = 'rejected'
                pet.rejection_reason = f'Обнаружено запрещённое слово: "{word}"'
                pet.save()
                return

    def notify_moderators(self, pet):
        # Уведомляем первого модератора
        moderator = User.objects.filter(is_staff=True).first()
        if moderator:
            Notification.objects.create(
                recipient=moderator,
                actor=pet.user,
                verb='moderation_pending',
                description=f'Новое объявление на модерацию: {pet.name or "Без имени"}'
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        pet = self.get_object()
        if pet.moderation_status == 'approved':
            return Response({'error': 'Уже одобрено'}, status=status.HTTP_400_BAD_REQUEST)
        pet.moderation_status = 'approved'
        pet.save()
        Notification.objects.create(
            recipient=pet.user,
            actor=request.user,
            verb='moderation_approved',
            description='Ваше объявление одобрено и опубликовано'
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        pet = self.get_object()
        reason = request.data.get('reason', 'Не соответствует правилам')
        if pet.moderation_status == 'rejected':
            return Response({'error': 'Уже отклонено'}, status=status.HTTP_400_BAD_REQUEST)
        pet.moderation_status = 'rejected'
        pet.rejection_reason = reason
        pet.save()
        Notification.objects.create(
            recipient=pet.user,
            actor=request.user,
            verb='moderation_rejected',
            description=f'Ваше объявление отклонено: {reason}'
        )
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def report(self, request, pk=None):
        pet = self.get_object()
        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'error': 'Укажите причину'}, status=status.HTTP_400_BAD_REQUEST)

        # 🔥 УЛУЧШЕНО: кликабельная ссылка и понятный заголовок
        pet_title = pet.name or pet.breed or 'Без имени'
        description = f'Жалоба на объявление "[{pet_title}](/pets/{pet.id}/)": {reason}'

        # Уведомляем ВСЕХ модераторов
        moderators = User.objects.filter(is_staff=True)
        for moderator in moderators:
            Notification.objects.create(
                recipient=moderator,
                actor=request.user,
                verb='report',
                description=description
            )
        return Response({'status': 'reported'})

    # 🔥 Остальные action без изменений
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
        pet.save(update_fields=['is_active'])
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pet_view_stats(request, pet_id):
    try:
        pet = Pet.objects.get(id=pet_id, user=request.user)
    except Pet.DoesNotExist:
        return Response({'error': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)
    week_ago = timezone.now() - timedelta(days=7)
    stats = ViewHistory.objects.filter(
        pet=pet,
        viewed_at__gte=week_ago
    ).extra(
        select={'date': "date(viewed_at)"}
    ).values('date').annotate(count=Count('id')).order_by('date')
    all_dates = [(week_ago + timedelta(days=i)).date() for i in range(8)]
    result = {item['date']: item['count'] for item in stats}
    filled = [{'date': d.isoformat(), 'count': result.get(d, 0)} for d in all_dates]
    return Response(filled)


class FavoriteViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Favorite.objects.filter(user=user).select_related('pet').prefetch_related(
            'pet__images') if user.is_authenticated else Favorite.objects.none()


# 🔥 AdminPetModerationViewSet УДАЛЁН — теперь используется PetViewSet с @action


# 🔥 НОВЫЙ: Динамические категории с реальным количеством
from django.db.models import Count


@api_view(['GET'])
def get_categories(request):
    species_labels = {
        'dog': 'Собаки', 'cat': 'Кошки', 'bird': 'Птицы',
        'rodent': 'Грызуны', 'fish': 'Рыбы', 'reptile': 'Рептилии', 'other': 'Другое',
    }
    species_icons = {
        'dog': '🐶', 'cat': '🐱', 'bird': '🐦', 'rodent': '🐹',
        'fish': '🐠', 'reptile': '🦎', 'other': '🐾',
    }
    counts = Pet.objects.filter(
        moderation_status='approved',
        is_active=True
    ).values('species').annotate(pet_count=Count('id')).order_by('-pet_count')
    categories = []
    for item in counts:
        species = item['species']
        if species in species_labels:
            categories.append({
                "id": species,
                "name": species_labels[species],
                "icon": species_icons[species],
                "pet_count": item['pet_count']
            })
    for species, name in species_labels.items():
        if not any(c['id'] == species for c in categories):
            categories.append({
                "id": species, "name": name, "icon": species_icons[species], "pet_count": 0
            })
    categories.sort(key=lambda x: x['pet_count'], reverse=True)
    return Response(categories)


# 🔥 НОВЫЙ: Эндпоинт для автокомплита пород
@api_view(['GET'])
def get_breeds(request):
    """Возвращает список пород с автокомплитом"""
    query = request.query_params.get('q', '').strip().lower()
    species = request.query_params.get('species', 'dog')  # по умолчанию — собаки

    # Список популярных пород (можно вынести в БД позже)
    popular_breeds = {
        'dog': [
            'Лабрадор', 'Немецкая овчарка', 'Такса', 'Хаски', 'Бульдог', 'Пудель',
            'Чихуахуа', 'Овчарка', 'Спаниель', 'Метис', 'Йоркширский терьер',
            'Ротвейлер', 'Далматин', 'Боксер', 'Ши-тцу', 'Пекинес'
        ],
        'cat': [
            'Сиамская', 'Британская', 'Мейн-кун', 'Сфинкс', 'Персидская', 'Метис',
            'Рэгдолл', 'Скоттиш-фолд', 'Абиссинская', 'Ориентальная', 'Бенгальская'
        ],
        'bird': [
            'Волнистый попугай', 'Корелла', 'Ара', 'Канарейка', 'Метис', 'Неразлучник',
            'Жако', 'Амазон', 'Какаду'
        ],
        'rodent': [
            'Хомяк', 'Морская свинка', 'Крыса', 'Мышь', 'Метис', 'Хорёк', 'Дегу'
        ],
        'fish': [
            'Гуппи', 'Золотая рыбка', 'Барбус', 'Сомик', 'Моллинезия', 'Пецилия',
            'Данио', 'Тетра', 'Аквариумная рыба'
        ],
        'reptile': [
            'Черепаха', 'Игуана', 'Змея', 'Геккон', 'Метис', 'Хамелеон', 'Варан'
        ],
        'other': [
            'Кролик', 'Лошадь', 'Коза', 'Овца', 'Метис', 'Свинья', 'Енот', 'Лиса'
        ],
    }

    breeds = popular_breeds.get(species, popular_breeds['dog'])

    if query:
        breeds = [b for b in breeds if query in b.lower()]

    return Response(breeds[:10])