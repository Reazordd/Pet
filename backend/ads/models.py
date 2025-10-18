from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Название категории")
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    icon = models.CharField(max_length=50, blank=True, null=True, verbose_name="Иконка (emoji)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Pet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets', verbose_name="Владелец")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Категория")

    name = models.CharField(max_length=255, verbose_name="Имя питомца")
    breed = models.CharField(max_length=255, blank=True, verbose_name="Порода")
    age = models.CharField(max_length=100, blank=True, verbose_name="Возраст")
    description = models.TextField(blank=True, verbose_name="Описание")
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Цена")
    photo = models.ImageField(upload_to='pets/', null=True, blank=True, verbose_name="Фото")

    is_active = models.BooleanField(default=True, verbose_name="Активное объявление")
    views_count = models.PositiveIntegerField(default=0, verbose_name="Просмотры")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Объявление"
        verbose_name_plural = "Объявления"

    def increment_views(self):
        """ Увеличивает количество просмотров (при открытии карточки) """
        self.views_count = models.F('views_count') + 1
        self.save(update_fields=['views_count'])
        # Принудительно обновляем объект в памяти
        self.refresh_from_db()

    def __str__(self):
        return f"{self.name} ({self.category})"
