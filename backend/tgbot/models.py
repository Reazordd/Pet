# backend/tgbot/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TelegramSubscription(models.Model):
    """Подписка пользователя на уведомления"""
    telegram_id = models.BigIntegerField(unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    species = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Подписка Telegram"
        verbose_name_plural = "Подписки Telegram"

    def __str__(self):
        return f"{self.telegram_id}: {self.species} в {self.city}"