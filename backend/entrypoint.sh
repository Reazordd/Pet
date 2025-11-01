#!/bin/sh
set -e

echo "📦 Ждём БД..."
until pg_isready -h "${DB_HOST:-db}" -U "${POSTGRES_USER:-petuser}"; do
  sleep 1
done

echo "📦 Применяем миграции..."
python manage.py migrate --noinput

echo "📦 Собираем статику..."
python manage.py collectstatic --noinput

echo "👤 Создаём суперпользователя если нужно..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
import sys;
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123');
    print('✅ Админ создан: admin / admin123');
else:
    print('ℹ️ Админ уже существует.');
sys.exit(0)
"

echo "🚀 Запускаем Daphne (ASGI)..."
exec daphne -b 0.0.0.0 -p 8000 pet_project.asgi:application
