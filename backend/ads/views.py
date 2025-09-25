from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Pet, Category, Notification
from .serializers import (
    PetSerializer,
    CategorySerializer,
    UserSerializer,
    UserProfileSerializer,
    NotificationSerializer
)
from .services import send_notification

User = get_user_model()

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(
        active_pets_count=Count('pet', filter=Q(pet__is_active=True))
    )
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination

    @action(detail=True, methods=['get'])
    def pets(self, request, pk=None):
        category = self.get_object()
        pets = Pet.objects.filter(
            category=category,
            is_active=True
        ).select_related('user', 'category')

        page = self.paginate_queryset(pets)
        if page is not None:
            serializer = PetSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PetSerializer(pets, many=True)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        notification_ids = request.data.get('ids', [])
        notifications = Notification.objects.filter(
            user=request.user,
            id__in=notification_ids
        )
        notifications.update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        )
        serializer = self.get_serializer(notifications, many=True)
        return Response({
            'count': notifications.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def recent(self, request):
        recent_time = timezone.now() - timedelta(days=7)
        notifications = Notification.objects.filter(
            user=request.user,
            created_at__gte=recent_time
        ).order_by('-created_at')

        page = self.paginate_queryset(notifications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

class UserCreateView(viewsets.ModelViewSet):
    """
    ViewSet для создания пользователей (регистрация)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['post']  # Разрешаем только POST запросы

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)

        # Send welcome notification
        send_notification(
            user=user,
            message='Добро пожаловать на PetMarket! Заполните профиль для лучших предложений.',
            notification_type='success'
        )

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Пользователь успешно зарегистрирован',
                'data': serializer.data,
                'tokens': self.get_tokens_for_user(user)
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def perform_create(self, serializer):
        return serializer.save()

    def get_tokens_for_user(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def retrieve(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def update(self, request):
        user = request.user
        serializer = UserProfileSerializer(
            user,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()

            # Notify about profile update
            send_notification(
                user=user,
                message='Ваш профиль был успешно обновлен',
                notification_type='success'
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        stats = {
            'total_pets': user.pets.count(),
            'active_pets': user.pets.filter(is_active=True).count(),
            'total_views': user.pets.aggregate(total_views=Sum('views_count'))['total_views'] or 0,
            'avg_price': user.pets.filter(price__isnull=False).aggregate(
                avg_price=Avg('price')
            )['avg_price'] or 0,
        }
        return Response(stats)

class PetViewSet(viewsets.ModelViewSet):
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['category', 'breed', 'age', 'price', 'is_active']
    search_fields = [
        'name', 'description', 'breed',
        'category__name', 'user__username'
    ]
    ordering_fields = [
        'age', 'name', 'price', 'created_at',
        'updated_at', 'views_count'
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Pet.objects.select_related(
            'user', 'category'
        ).prefetch_related('user__pets')

        # For anonymous users, show only active pets
        if not self.request.user.is_authenticated:
            return queryset.filter(is_active=True)

        # For authenticated users, show their all pets and others' active pets
        if self.action == 'list':
            return queryset.filter(
                Q(is_active=True) | Q(user=self.request.user)
            )
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Increment views count for active pets
        if instance.is_active and instance.user != request.user:
            instance.increment_views()

            # Notify owner about new view
            if request.user.is_authenticated:
                send_notification(
                    user=instance.user,
                    message=f'Ваше объявление "{instance.name}" просмотрели',
                    notification_type='info'
                )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        pet = serializer.save(user=self.request.user)

        # Send notification to user
        send_notification(
            user=self.request.user,
            message=f'Объявление "{pet.name}" успешно создано',
            notification_type='success'
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.user != self.request.user:
            raise PermissionDenied("Вы не можете редактировать это объявление")

        old_price = instance.price
        pet = serializer.save()

        # Notify about significant changes
        if old_price != pet.price:
            send_notification(
                user=self.request.user,
                message=f'Цена в объявлении "{pet.name}" изменена',
                notification_type='info'
            )

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("Вы не можете удалить это объявление")

        instance.is_active = False
        instance.save()

        send_notification(
            user=self.request.user,
            message=f'Объявление "{instance.name}" деактивировано',
            notification_type='warning'
        )

    @action(detail=False, methods=['get'])
    def my_pets(self, request):
        pets = Pet.objects.filter(user=request.user)

        page = self.paginate_queryset(pets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(pets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured pets (most viewed in last 7 days)"""
        week_ago = timezone.now() - timedelta(days=7)
        featured_pets = Pet.objects.filter(
            is_active=True,
            created_at__gte=week_ago
        ).order_by('-views_count', '-created_at')[:12]

        serializer = self.get_serializer(featured_pets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        pet = self.get_object()
        if pet.user != request.user:
            raise PermissionDenied("Вы не можете изменять статус этого объявления")

        pet.is_active = not pet.is_active
        pet.save()

        status_text = "активировано" if pet.is_active else "деактивировано"
        send_notification(
            user=request.user,
            message=f'Объявление "{pet.name}" {status_text}',
            notification_type='success' if pet.is_active else 'warning'
        )

        return Response({
            'is_active': pet.is_active,
            'message': f'Объявление {status_text}'
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Global statistics for dashboard"""
        stats = {
            'total_pets': Pet.objects.count(),
            'active_pets': Pet.objects.filter(is_active=True).count(),
            'total_users': User.objects.count(),
            'total_views': Pet.objects.aggregate(
                total_views=Sum('views_count')
            )['total_views'] or 0,
            'recent_pets': Pet.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count(),
        }
        return Response(stats)
