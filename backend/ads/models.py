from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MinLengthValidator
from django.utils.text import slugify

User = get_user_model()


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', 'Информация'),
        ('success', 'Успех'),
        ('warning', 'Предупреждение'),
        ('error', 'Ошибка'),
    ]

    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'

    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, validators=[MinLengthValidator(3)])
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, default='🐾')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Pet(models.Model):
    # breed — теперь свободная строка, пользователь вводит вручную
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    breed = models.CharField(max_length=150)  # свободный ввод
    name = models.CharField(max_length=100)
    # age — свободный текст (например "3 месяца", "2 года", "45 дней")
    age = models.CharField(max_length=50, help_text="Укажите возраст: '3 месяца', '2 года', '45 дней' и т.д.")
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    photo = models.ImageField(upload_to='pets/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])

    def __str__(self):
        return f"{self.name} ({self.breed})"


class Favorite(models.Model):
    user = models.ForeignKey(User, related_name='favorites', on_delete=models.CASCADE)
    pet = models.ForeignKey(Pet, related_name='favorites', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'pet')
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранные'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.pet.name}"
