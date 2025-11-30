from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
import time
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_welcome_email(user_email):
    """Отправка приветственного письма после регистрации"""
    send_mail(
        subject="Добро пожаловать в PetMarket 🐾",
        message="Спасибо за регистрацию! Теперь вы можете размещать объявления о животных.",
        from_email="webmaster@yourdomain.com",
        recipient_list=[user_email],
        fail_silently=False,
    )
    logger.info(f"✅ Отправлено письмо пользователю: {user_email}")
    return f"Welcome email sent to {user_email}"


@shared_task
def clean_old_ads():
    """Удаляет объявления старше 90 дней (пример плановой задачи)"""
    from ads.models import Ad
    threshold_date = timezone.now() - timezone.timedelta(days=90)
    deleted, _ = Ad.objects.filter(created_at__lt=threshold_date).delete()
    logger.info(f"🧹 Удалено старых объявлений: {deleted}")
    return f"Deleted {deleted} old ads"


@shared_task
def check_new_messages():
    """Проверяет новые сообщения каждые 30 сек (пример периодической задачи)"""
    from chat.models import Message
    count = Message.objects.filter(is_read=False).count()
    logger.info(f"📩 Непрочитанных сообщений: {count}")
    return f"{count} unread messages found"


@shared_task
def long_task_simulation():
    """Имитация долгой операции (для тестов)"""
    for i in range(5):
        logger.info(f"Progress: {i+1}/5")
        time.sleep(2)
    logger.info("Long task completed ✅")
    return "Done!"
