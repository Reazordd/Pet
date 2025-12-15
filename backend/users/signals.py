# backend/users/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import User
from ads.models import Pet

@receiver(post_save, sender=Pet)
@receiver(post_delete, sender=Pet)
def update_user_trusted_status(sender, instance, **kwargs):
    """Обновляет статус продавца при создании/изменении/удалении объявления"""
    if instance.user:
        instance.user.update_trusted_seller_status()