from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator, MinValueValidator
from django.utils import timezone

class User(AbstractUser):
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        default='avatars/default.png'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[MinLengthValidator(10)]
    )
    address = models.TextField(blank=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)

    # Fix related_name conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='ads_users',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='ads_users_permissions',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.username} ({self.email})"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', 'Информация'),
        ('warning', 'Предупреждение'),
        ('success', 'Успех'),
        ('error', 'Ошибка'),
    ]

    user = models.ForeignKey(
        User,
        related_name='notifications',
        on_delete=models.CASCADE
    )
    message = models.TextField()
    notification_type = models.CharField(
        max_length=10,
        choices=NOTIFICATION_TYPES,
        default='info'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'

    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}"

class Category(models.Model):
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(3)],
        unique=True
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    icon = models.CharField(max_length=50, blank=True, default='🐾')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def __str__(self):
        return self.name

class Pet(models.Model):
    BREED_CHOICES = [
        ('dog', 'Собаки'),
        ('cat', 'Кошки'),
        ('bird', 'Птицы'),
        ('fish', 'Рыбы'),
        ('rodent', 'Грызуны'),
        ('reptile', 'Рептилии'),
        ('other', 'Другие животные'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets')
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    breed = models.CharField(max_length=20, choices=BREED_CHOICES)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    photo = models.ImageField(
        upload_to='pets/',
        blank=True,
        null=True
    )
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Животное'
        verbose_name_plural = 'Животные'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'created_at']),
            models.Index(fields=['breed']),
            models.Index(fields=['price']),
        ]

    def __str__(self):
        return f"{self.name} ({self.breed})"

    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])

    def save(self, *args, **kwargs):
        if not self.category:
            # Auto-assign category based on breed
            category_map = {
                'dog': 'Собаки',
                'cat': 'Кошки',
                'bird': 'Птицы',
                'fish': 'Рыбы',
                'rodent': 'Грызуны',
                'reptile': 'Рептилии',
            }
            category_name = category_map.get(self.breed, 'Другие животные')
            self.category, _ = Category.objects.get_or_create(
                name=category_name,
                defaults={'description': f'Объявления о {category_name.lower()}'}
            )
        super().save(*args, **kwargs)





