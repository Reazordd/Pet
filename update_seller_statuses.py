# update_seller_statuses.py
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pet_project.settings")
django.setup()

from users.models import User

for user in User.objects.all():
    user.update_trusted_seller_status()
    print(f"Updated {user.username}: trusted={user.is_trusted_seller}")