from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Pet, Category
from .serializers import PetSerializer, CategorySerializer
from .filters import PetFilter
from .pagination import StandardResultsSetPagination


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Категории животных (как на Авито — просто список)"""
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class PetViewSet(viewsets.ModelViewSet):
    """CRUD для объявлений животных (аналог Авито)"""
    queryset = Pet.objects.all().select_related('category', 'user')
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PetFilter
    search_fields = ['name', 'breed', 'description']
    ordering_fields = ['created_at', 'price', 'views_count']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        # неавторизованные видят только активные
        if not self.request.user.is_authenticated:
            return qs.filter(is_active=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def increment_views(self, request, pk=None):
        """Инкремент просмотров"""
        pet = self.get_object()
        pet.increment_views()
        return Response({'id': pet.id, 'views_count': pet.views_count})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_pets(self, request):
        """Мои объявления"""
        qs = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_active(self, request, pk=None):
        """Скрыть/показать объявление (аналог Авито)"""
        pet = self.get_object()
        if pet.user != request.user and not request.user.is_staff:
            return Response({'detail': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)
        pet.is_active = not pet.is_active
        pet.save(update_fields=['is_active'])
        return Response({
            'id': pet.id,
            'is_active': pet.is_active,
            'message': 'Объявление активировано' if pet.is_active else 'Объявление скрыто'
        })
