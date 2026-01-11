# backend/forum/models.py

from django.db import models
from django.conf import settings
from django.utils.text import slugify

UserModel = settings.AUTH_USER_MODEL


class ForumCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Категория форума"
        verbose_name_plural = "Категории форума"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ForumTopic(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="forum_topics"
    )
    category = models.ForeignKey(
        ForumCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="topics"
    )
    # likes для тем (ManyToMany)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="liked_topics", blank=True)

    is_approved = models.BooleanField(default=True)
    is_locked = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Тема форума"
        verbose_name_plural = "Темы форума"

    def __str__(self):
        return f"{self.title} ({'Одобрено' if self.is_approved else 'Ожидает модерации'})"


class ForumComment(models.Model):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()

    # moderation
    is_approved = models.BooleanField(default=False, help_text="Одобрен модератором")

    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="liked_comments", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Комментарий форума"
        verbose_name_plural = "Комментарии форума"

    def __str__(self):
        return f"Комментарий от {self.author} на {self.topic}"


