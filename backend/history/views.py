# backend/history/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Prefetch
from .models import ViewHistory
from .serializers import ViewHistorySerializer
from ads.models import Pet

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_view_history(request):
    # 🔥 Оптимизируем: предзагрузим питомцев с их фото
    history = ViewHistory.objects.filter(user=request.user).select_related('pet').prefetch_related(
        'pet__images'
    ).order_by('-viewed_at')
    serializer = ViewHistorySerializer(history, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_history(request, pet_id):
    try:
        pet = Pet.objects.get(id=pet_id)
    except Pet.DoesNotExist:
        return Response({'error': 'Питомец не найден'}, status=status.HTTP_404_NOT_FOUND)

    ViewHistory.objects.get_or_create(user=request.user, pet=pet)
    return Response({'message': 'Добавлено в историю'})