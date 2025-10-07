import logging
from .models import Notification

logger = logging.getLogger(__name__)

def send_notification(user, message, notification_type='info'):
    """Создаёт уведомление пользователю"""
    Notification.objects.create(user=user, message=message, notification_type=notification_type)
    logger.info(f"Notification sent to {user.username}: {message}")
