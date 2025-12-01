# backend/ads/models.py
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class PetImage(models.Model):
    pet = models.ForeignKey('Pet', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='pets/')
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.pet.name or 'Pet'}"

class Pet(models.Model):
    SPECIES_CHOICES = [
        ('dog', 'Собака'),
        ('cat', 'Кошка'),
        ('bird', 'Птица'),
        ('fish', 'Рыба'),
        ('reptile', 'Рептилия'),
        ('rodent', 'Грызун'),
        ('other', 'Другое'),
    ]

    OFFER_TYPE_CHOICES = [
        ('sale', 'Продажа'),
        ('giveaway', 'Отдам'),
        ('search', 'Ищу'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets')  # 🔥 Не null=True
    name = models.CharField('Имя питомца', max_length=100, blank=True)
    species = models.CharField('Вид', max_length=20, choices=SPECIES_CHOICES)
    breed = models.CharField('Порода', max_length=100, blank=True)
    age = models.PositiveSmallIntegerField('Возраст (лет)', null=True, blank=True)
    price = models.DecimalField('Цена (₽)', max_digits=10, decimal_places=2, null=True, blank=True)
    offer_type = models.CharField('Тип объявления', max_length=10, choices=OFFER_TYPE_CHOICES, default='sale')
    city = models.CharField('Город', max_length=100)
    description = models.TextField('Описание', blank=True)
    image = models.ImageField('Фото', upload_to='pets/')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField('Одобрено', default=False)
    is_hidden = models.BooleanField('Скрыто', default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Питомец'
        verbose_name_plural = 'Питомцы'

    def __str__(self):
        return f"{self.name or 'Без имени'} ({self.get_species_display()}) — {self.city}"

    def save(self, *args, **kwargs):
        if self.offer_type != 'sale':
            self.price = None
        super().save(*args, **kwargs)

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'pet')
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранное'

    def __str__(self):
        return f"{self.user} → {self.pet}"