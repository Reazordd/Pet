# backend/reviews/models.py
from django.db import models
from django.contrib.auth import get_user_model
from ads.models import Pet

User = get_user_model()

class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    reviewed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reviews')
    pet = models.ForeignKey(Pet, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    transaction_completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ('reviewer', 'reviewed')
        ordering = ['-created_at']
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'

    def __str__(self):
        return f'{self.reviewer.username} → {self.reviewed.username} ({self.rating} звёзд)'