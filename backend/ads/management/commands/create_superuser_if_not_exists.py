# backend/ads/management/commands/create_superuser_if_not_exists.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = "Create superuser from env vars if not exists"

    def handle(self, *args, **options):
        username = os.getenv("DJANGO_SUPERUSER_USERNAME")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL")
        if not username or not password or not email:
            self.stdout.write("Superuser env vars missing, skipping")
            return
        if User.objects.filter(username=username).exists():
            self.stdout.write("Superuser already exists")
            return
        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write("Superuser created")
