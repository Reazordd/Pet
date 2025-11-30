# backend/history/models.py
from django.db import models
from django.contrib.auth import get_user_model
from ads.models import Pet  # Убедитесь, что модель Pet существует

User = get_user_model()

class ViewHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='viewed_pets')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='viewed_by_users')  # 🔥 Добавлено `related_name`
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-viewed_at']
        verbose_name = 'Просмотр питомца'
        verbose_name_plural = 'Просмотры питомцев'
        unique_together = ('user', 'pet')  # Один питомец не может быть дважды в истории у одного юзера

    def __str__(self):
        return f"{self.user.username} → {self.pet.name or 'Без имени'}"