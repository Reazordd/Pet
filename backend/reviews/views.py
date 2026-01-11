# backend/reviews/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from .models import Review
from .serializers import ReviewSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_reviews_for_user(request, user_id):
    """Получить отзывы О пользователе (полученные)"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

    reviews = Review.objects.filter(reviewed=user).select_related('reviewer', 'pet')
    serializer = ReviewSerializer(reviews, many=True, context={'request': request})

    ratings = reviews.aggregate(
        avg_rating=Avg('rating'),
        total_reviews=Count('id'),
        five_star=Count('id', filter=Q(rating=5)),
        four_star=Count('id', filter=Q(rating=4)),
        three_star=Count('id', filter=Q(rating=3)),
        two_star=Count('id', filter=Q(rating=2)),
        one_star=Count('id', filter=Q(rating=1)),
    )

    return Response({
        'reviews': serializer.data,
        'rating_stats': {
            'avg_rating': round(ratings['avg_rating'] or 0, 1),
            'total_reviews': ratings['total_reviews'],
            'distribution': {
                5: ratings['five_star'],
                4: ratings['four_star'],
                3: ratings['three_star'],
                2: ratings['two_star'],
                1: ratings['one_star'],
            }
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_given_reviews(request, user_id):
    """Получить отзывы, оставленные пользователем (отправленные)"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

    reviews = Review.objects.filter(reviewer=user).select_related('reviewed', 'pet')
    serializer = ReviewSerializer(reviews, many=True, context={'request': request})
    return Response({'reviews': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_or_update_review(request, user_id):
    """Создать или обновить отзыв о пользователе"""
    try:
        reviewed_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

    if request.user == reviewed_user:
        return Response({'error': 'Нельзя оставить отзыв самому себе'}, status=status.HTTP_400_BAD_REQUEST)

    existing_review = Review.objects.filter(
        reviewer=request.user,
        reviewed=reviewed_user
    ).first()

    pet_id = request.data.get('pet_id')
    pet = None
    if pet_id:
        from ads.models import Pet
        try:
            pet = Pet.objects.get(id=pet_id, user=reviewed_user)
        except Pet.DoesNotExist:
            pass

    if existing_review:
        serializer = ReviewSerializer(existing_review, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save(pet=pet)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            review = serializer.save(
                reviewer=request.user,
                reviewed=reviewed_user,
                pet=pet,
                transaction_completed=True
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)