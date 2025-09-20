# ads/models.py

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator

class Category(models.Model):
    name = models.CharField(max_length=100, validators=[MinLengthValidator(3)])
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Pet(models.Model):
    BREED_CHOICES = [
        ('dog', _('Собаки')),
        ('cat', _('Кошки')),
        ('bird', _('Птицы')),
        ('fish', _('Рыбы')),
        ('other', _('Другие животные')),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    breed = models.CharField(max_length=10, choices=BREED_CHOICES)
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    photo = models.ImageField(upload_to='pets/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name




