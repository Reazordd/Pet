# ads/views.py

from rest_framework import generics
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.core.exceptions import PermissionDenied
from django.db.models import Count
from django.contrib.auth.models import User
from.models import Pet, Category, User
from.serializers import PetSerializer, CategorySerializer, UserSerializer, UserProfileSerializer
from django.contrib.auth import get_user_model

User = get_user_model()  # Добавляем эту строку в начало файла

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()  # Теперь используем правильную модель
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Возможно, нужно разрешить создание


class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def update(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Пользователь успешно зарегистрирован',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all()
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'breed', 'age', 'price']
    search_fields = ['name', 'description', 'breed', 'category__name']
    ordering_fields = ['age', 'name', 'price', 'created_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_pets(self, request):
        pets = Pet.objects.filter(user=request.user)
        serializer = self.get_serializer(pets, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Проверка прав на редактирование
        if instance.user != request.user:
            raise PermissionDenied("You do not have permission to update this pet")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Проверка прав на удаление
        if instance.user != request.user:
            raise PermissionDenied("You do not have permission to delete this pet")

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Дополнительная проверка при создании категории
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can create categories")

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Дополнительная проверка при обновлении категории
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can update categories")

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Дополнительная проверка при удалении категории
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can delete categories")

        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        # Получение популярных категорий (с наибольшим количеством питомцев)
        categories = Category.objects.annotate(
            pet_count=Count('pet')
        ).order_by('-pet_count')
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)





