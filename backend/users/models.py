# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from ads.models import Pet

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    email_verified = models.BooleanField(default=False)

    # 🔥 Поля для Avito-статусов
    is_trusted_seller = models.BooleanField(default=False, verbose_name="Надёжный продавец")
    avito_delivery_count = models.PositiveIntegerField(default=0, verbose_name="Покупки с Pet Доставкой")
    is_company_verified = models.BooleanField(default=False, verbose_name="Компания проверена")

    # Для модерации и блокировки
    is_blocked = models.BooleanField(default=False,
                                     help_text="Если отмечено — пользователь заблокирован и не может постить/комментировать")

    # 🔥 НОВОЕ ПОЛЕ для Telegram OAuth
    telegram_id = models.BigIntegerField(unique=True, null=True, blank=True, verbose_name="ID в Telegram")

    REQUIRED_FIELDS = ["email"]
    USERNAME_FIELD = "username"

    def __str__(self):
        return f"{self.username} ({self.email})" if self.email else self.username

    def update_trusted_seller_status(self):
        active_pets_count = Pet.objects.filter(
            user=self,
            moderation_status='approved',
            is_active=True
        ).count()
        self.is_trusted_seller = active_pets_count >= 5
        self.save(update_fields=['is_trusted_seller'])

    def update_avito_delivery_count(self):
        pass


# 🔥 Модель PhoneNumber остаётся без изменений
class PhoneNumber(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='phone_number')
    number = models.CharField(
        max_length=15,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\+?[379]\d{9,12}$',
                message="Номер телефона должен быть в международном формате: +380991234567"
            )
        ],
        help_text="Международный формат: +79991234567"
    )
    verified = models.BooleanField(default=False, help_text="Подтверждён ли номер через SMS")
    verification_code = models.CharField(max_length=6, blank=True, null=True, help_text="Код для верификации")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Номер телефона"
        verbose_name_plural = "Номера телефонов"

    def __str__(self):
        return f"{self.number} ({'✅' if self.verified else '⏳'})"