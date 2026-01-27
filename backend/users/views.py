import logging
import requests
from django.contrib.auth.tokens import default_token_generator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Prefetch, Count, Avg
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from ads.models import Pet
from reviews.models import Review
from .serializers import UserSerializer
from .utils import account_activation_token, verify_telegram_auth_data
from django.conf import settings
from .models import PhoneNumber
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
import os
from urllib.parse import urlparse

User = get_user_model()
logger = logging.getLogger(__name__)


# 🔥 ИСПРАВЛЕНО: поддержка GET и POST для Telegram
@csrf_exempt
def telegram_auth(request):
    """
    Обработка запросов от Telegram Login Widget.
    Должен поддерживать GET (проверка) и POST (авторизация).
    """
    if request.method == 'GET':
        # Telegram проверяет доступность эндпоинта — ОБЯЗАТЕЛЬНО!
        return HttpResponse("OK", status=200)

    if request.method == 'POST':
        data = request.POST.dict()
        bot_token = settings.TELEGRAM_LOGIN_BOT_TOKEN

        if not verify_telegram_auth_data(data, bot_token):
            logger.warning("Invalid Telegram auth data")
            return HttpResponse("Invalid data", status=400)

        telegram_id = int(data['id'])
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        photo_url = data.get('photo_url', '')

        user, created = User.objects.get_or_create(
            telegram_id=telegram_id,
            defaults={
                'username': f"tg_{telegram_id}",
                'email': f"{telegram_id}@telegram.bot",
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
                'email_verified': True,
            }
        )

        if not created:
            updated = False
            if user.first_name != first_name:
                user.first_name = first_name
                updated = True
            if user.last_name != last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save(update_fields=['first_name', 'last_name'])

        # Загрузка аватарки
        if photo_url and not user.avatar:
            try:
                response = requests.get(photo_url, timeout=10)
                if response.status_code == 200:
                    ext = os.path.splitext(urlparse(photo_url).path)[1] or '.jpg'
                    avatar_name = f"tg_{telegram_id}{ext}"
                    user.avatar.save(avatar_name, ContentFile(response.content), save=True)
            except Exception as e:
                logger.error(f"Failed to download Telegram avatar: {e}")

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response_html = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Вход выполнен</title></head>
        <body>
          <script>
            localStorage.setItem('authToken', '{access_token}');
            window.location.href = '{settings.FRONTEND_URL}/profile';
          </script>
          <p>Авторизация прошла успешно. Переход...</p>
        </body>
        </html>
        """
        return HttpResponse(response_html, content_type='text/html; charset=utf-8')

    return HttpResponse("Method not allowed", status=405)


# 🔥 Яндекс OAuth (исправлены URL — убраны пробелы!)
@api_view(['POST'])
@permission_classes([AllowAny])
def yandex_oauth_callback(request):
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Code required'}, status=status.HTTP_400_BAD_REQUEST)

    token_url = 'https://oauth.yandex.ru/token'  # ← БЕЗ ПРОБЕЛОВ!
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': '66ec70274ad44a78ae44f21ce89f9eee',
        'client_secret': '34f640430f2144e0b28ce4c91a7da0f0'
    }

    try:
        token_response = requests.post(token_url, data=token_data, timeout=10)
        token_response.raise_for_status()
        access_token = token_response.json()['access_token']
    except Exception as e:
        return Response({'error': 'Failed to exchange code'}, status=status.HTTP_400_BAD_REQUEST)

    user_url = 'https://login.yandex.ru/info?format=json'  # ← БЕЗ ПРОБЕЛОВ!
    try:
        user_response = requests.get(user_url, headers={'Authorization': f'OAuth {access_token}'}, timeout=10)
        user_response.raise_for_status()
        yandex_data = user_response.json()
    except Exception as e:
        return Response({'error': 'Failed to get user info'}, status=status.HTTP_400_BAD_REQUEST)

    email = yandex_data.get('default_email')
    login = yandex_data.get('login', 'yandex_user')
    first_name = yandex_data.get('first_name', '')
    last_name = yandex_data.get('last_name', '')

    if not email:
        return Response({'error': 'Email not provided by Yandex'}, status=status.HTTP_400_BAD_REQUEST)

    email = email.strip().lower()

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = User.objects.create(
            email=email,
            username=login,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            email_verified=True
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    user = request.user
    pets = Pet.objects.filter(user=user)
    reviews = Review.objects.filter(reviewed=user).select_related('reviewer')

    serializer = UserSerializer(
        user,
        context={
            'request': request,
            'prefetched_pets': pets,
            'prefetched_reviews': reviews
        }
    )
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_my_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile(request, user_id):
    try:
        user = User.objects.prefetch_related(
            Prefetch('pets', queryset=Pet.objects.filter(
                is_active=True,
                moderation_status='approved'
            )),
            Prefetch('received_reviews', queryset=Review.objects.select_related('reviewer'))
        ).get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_stats(request):
    user = request.user

    total_pets = Pet.objects.filter(user=user).count()
    active_pets = Pet.objects.filter(
        user=user,
        moderation_status='approved',
        is_active=True
    ).count()
    avg_price = Pet.objects.filter(user=user, offer_type='sale').aggregate(avg=Avg('price'))['avg'] or 0

    total_reviews = Review.objects.filter(reviewed=user).count()
    avg_rating = Review.objects.filter(reviewed=user).aggregate(avg=Avg('rating'))['avg'] or 0

    return Response({
        'total_pets': total_pets,
        'active_pets': active_pets,
        'avg_price': round(avg_price, 2),
        'total_reviews': total_reviews,
        'avg_rating': round(avg_rating, 2),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def password_change(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({'error': 'Старый и новый пароль обязательны'}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({'error': 'Старый пароль неверен'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({'error': 'Пароль должен содержать минимум 6 символов'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Пароль успешно изменён'})


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data

    required = ['username', 'email', 'password']
    for field in required:
        if field not in data or not data[field].strip():
            return Response({field: 'Это поле обязательно'}, status=status.HTTP_400_BAD_REQUEST)

    if data.get("password") != data.get("password_confirm"):
        return Response({"password": "Пароли не совпадают"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=data["username"]).exists():
        return Response({"username": "Пользователь с таким именем уже существует"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=data["email"]).exists():
        return Response({"email": "Пользователь с таким email уже существует"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_data = {
            'username': data["username"],
            'email': data["email"],
            'first_name': data.get("first_name", ""),
            'last_name': data.get("last_name", ""),
            'is_active': False,
            'email_verified': False,
        }
        user = User.objects.create(**user_data)
        user.set_password(data["password"])
        user.save()

        phone = data.get("phone")
        if phone:
            clean_phone = ''.join(c for c in phone if c.isdigit() or c == '+')
            if clean_phone.startswith('8'):
                clean_phone = '+7' + clean_phone[1:]
            elif clean_phone and not clean_phone.startswith('+'):
                clean_phone = '+' + clean_phone

            from django.core.validators import RegexValidator
            from django.core.exceptions import ValidationError
            phone_validator = RegexValidator(
                regex=r'^\+?[379]\d{9,12}$',
                message="Номер телефона должен быть в международном формате: +380991234567"
            )
            try:
                phone_validator(clean_phone)
                PhoneNumber.objects.create(user=user, number=clean_phone, verified=True)
            except ValidationError:
                pass

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)
        activation_link = f"{settings.FRONTEND_URL}/activate/{uid}/{token}/"

        send_mail(
            subject="Подтвердите ваш email — PetMarket",
            message=f"Перейдите по ссылке для подтверждения: {activation_link}",
            from_email="reazordd@yandex.ru",
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({"message": "Проверьте email для подтверждения"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def activate_account(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.email_verified = True
        user.save()
        return Response({"message": "Аккаунт подтверждён! Теперь вы можете войти."})
    else:
        return Response({"error": "Неверная или устаревшая ссылка"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email обязателен'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_mail(
            subject="Сброс пароля — PetMarket",
            message=f"Перейдите по ссылке для сброса пароля: {reset_link}",
            from_email="reazordd@yandex.ru",
            recipient_list=[email],
            fail_silently=False,
        )
    except User.DoesNotExist:
        pass

    return Response({"message": "Если email зарегистрирован, письмо отправлено"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Неверная ссылка'}, status=400)

    if user is not None and default_token_generator.check_token(user, token):
        new_password = request.data.get('password')
        if not new_password:
            return Response({'error': 'Пароль обязателен'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Пароль успешно изменён"})
    else:
        return Response({'error': 'Ссылка недействительна или устарела'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_chats(request):
    from chat.models import Chat
    from chat.serializers import ChatSerializer

    chats = Chat.objects.filter(users=request.user).prefetch_related('users', 'messages')
    serializer = ChatSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data)