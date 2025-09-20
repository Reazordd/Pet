# tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from.models import Pet, Category

class PetTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Кошки')
        self.user = User.objects.create_user(username='testuser', password='123456')
        self.client.force_authenticate(user=self.user)

    def test_create_pet(self):
        url = reverse('pet-list')
        data = {
            'name': 'Мурзик',
            'category': self.category.id,
            'age': 2,
            'description': 'Добрый котик',
            'price': 1000
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pet.objects.count(), 1)
