# backend/ads/management/commands/create_test_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ads.models import Ad  # если модель объявлений в ads app
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = "Create sample users and ads for local development"

    def handle(self, *args, **options):
        # create sample users
        sample_users = [
            {"username": "alice", "email": "alice@example.com", "password": "pass12345"},
            {"username": "bob", "email": "bob@example.com", "password": "pass12345"},
            {"username": "carol", "email": "carol@example.com", "password": "pass12345"},
        ]

        for u in sample_users:
            if not User.objects.filter(username=u["username"]).exists():
                user = User.objects.create_user(username=u["username"], email=u["email"], password=u["password"])
                self.stdout.write(self.style.SUCCESS(f"Created user {user.username}"))
            else:
                self.stdout.write(f"User {u['username']} already exists")

        # create sample ads if ads model exists
        try:
            if Ad.objects.count() == 0:
                owners = list(User.objects.all())
                titles = ["Friendly kitten", "Lost dog", "Parrot for sale", "Goldfish", "Friendly rabbit"]
                for i in range(10):
                    owner = random.choice(owners)
                    title = random.choice(titles)
                    Ad.objects.create(
                        title=f"{title} #{i}",
                        description=f"Auto-generated ad {i} — good condition",
                        owner=owner,
                        price=random.randint(10, 5000),
                        created_at=timezone.now()
                    )
                self.stdout.write(self.style.SUCCESS("Created 10 sample ads"))
            else:
                self.stdout.write("Ads already exist, skipping ad creation")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Could not create ads: {e}"))
