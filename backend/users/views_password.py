# backend/users/views_password.py


from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings

User = get_user_model()

class PasswordResetRequestView(generics.GenericAPIView):
    """
    POST /api/users/password-reset/  { "email": "user@example.com" }
    Отправляет письмо с токеном (ссылка должна вести на фронтенд-форму, где пользователь введёт новый пароль).
    """
    permission_classes = []
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "email required"}, status=status.HTTP_400_BAD_REQUEST)
        qs = User.objects.filter(email=email)
        if not qs.exists():
            return Response({"detail": "Если учётная запись существует, письмо отправлено"}, status=status.HTTP_200_OK)
        user = qs.first()
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        # Ссылка для фронта (замените FRONTEND_URL в .env)
        frontend_url = settings.FRONTEND_URL.rstrip("/") if hasattr(settings, "FRONTEND_URL") else "http://localhost:8080"
        reset_link = f"{frontend_url}/password-reset/confirm/?uid={uid}&token={token}"
        subject = "Сброс пароля на PetMarket"
        message = f"Перейдите по ссылке, чтобы сбросить пароль: {reset_link}"
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
        return Response({"detail": "Если учётная запись существует, письмо отправлено"}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    POST /api/users/password-reset/confirm/ { "uid": "...", "token": "...", "password": "..." }
    """
    permission_classes = []
    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        if not uid or not token or not password:
            return Response({"detail": "uid, token и password required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except Exception:
            return Response({"detail": "Неверный uid"}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Неверный или просроченный токен"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({"detail": "Пароль успешно изменён"}, status=status.HTTP_200_OK)
