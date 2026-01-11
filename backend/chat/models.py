# backend/chat/models.py
from django.db import models
from django.conf import settings
from ads.models import Pet

User = settings.AUTH_USER_MODEL

class Chat(models.Model):
    users = models.ManyToManyField(User, related_name='chats')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, null=True, blank=True)  # ← новое поле
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        usernames = ", ".join(self.users.values_list('username', flat=True))
        return f"Chat: {usernames}"

class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        if self.content:
            return f"{self.sender.username}: {self.content[:20]}"
        return f"{self.sender.username}: [Фото]"