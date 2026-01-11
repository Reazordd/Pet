#!/bin/bash
set -euo pipefail

echo "➡️ Entrypoint started for: $@"

export DJANGO_SETTINGS_MODULE=pet_project.settings

# Ждём БД
echo "⏳ Waiting for PostgreSQL..."
until python -c "
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pet_project.settings')
try:
    import django; django.setup()
    from django.db import connections
    connections['default'].ensure_connection()
except Exception:
    sys.exit(1)
"; do
  sleep 1
done
echo "✅ DB ready"

# Директории
mkdir -p /app/media /app/staticfiles

# Создаём миграции
echo "🔧 Creating migrations..."
python manage.py makemigrations

# Применяем миграции
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Создаём суперпользователя
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
    echo "👤 Ensuring superuser exists..."
    python <<PY
import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pet_project.settings")
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.getenv("DJANGO_SUPERUSER_USERNAME")
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"✅ Created superuser: {username}")
else:
    print(f"⚠️ Superuser already exists: {username}")
PY
else
    echo "⚠️ DJANGO_SUPERUSER credentials not set."
fi

# Собираем статику
echo "📦 Collecting static..."
python manage.py collectstatic --noinput --clear

echo "🚀 Starting: $@"
exec "$@"