#!/bin/bash
set -euo pipefail

echo "➡️ Starting Pet Marketplace (Django + React/Vite)..."

cd "$(dirname "$0")"

export DJANGO_SETTINGS_MODULE=pet_project.settings
export PYTHONUNBUFFERED=1

# Создаём папки
mkdir -p backend/media backend/staticfiles

# === БЭКЕНД ===
cd backend

# 🔑 КЛЮЧЕВОЕ: загружаем .env в переменные окружения bash
if [ -f .env ]; then
    echo "🔑 Loading .env variables..."
    # Удаляем комментарии и пустые строки, экспортируем всё
    export $(grep -v '^#' .env | xargs)
fi

echo "🔧 Applying migrations..."
python manage.py migrate --noinput

# Создание суперпользователя
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
    echo "👤 Ensuring superuser exists..."
    python <<PY
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pet_project.settings")
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.getenv("DJANGO_SUPERUSER_USERNAME")
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"✅ Created superuser: {username}")
else:
    print(f"⚠️ Superuser already exists: {username}")
PY
else
    echo "⚠️ DJANGO_SUPERUSER_* not set — skipping"
fi

echo "📦 Collecting static..."
python manage.py collectstatic --noinput --clear

echo "🚀 Starting Django backend on http://localhost:8000 ..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# === ФРОНТЕНД ===
cd ../frontend

echo "🚀 Starting React frontend (Vite) on http://localhost:3000 ..."
npm run dev &
FRONTEND_PID=$!

# Обработка завершения
trap 'echo "🛑 Shutting down..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM

echo "✅ Both servers are running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   Press Ctrl+C to stop."

wait