#!/bin/sh
set -e

echo "⏳ Ожидание доступности базы данных PostgreSQL..."
until pg_isready -h db -p 5432 -U petuser > /dev/null 2>&1; do
  echo "📡 Ждём базу..."
  sleep 2
done

echo "✅ База данных готова!"

# Выполняем миграции, собираем статику, создаем суперпользователя
echo "🚀 Применяем миграции и собираем статику..."
python manage.py collectstatic --noinput
python manage.py migrate

echo "👤 Проверяем суперпользователя..."
python manage.py shell -c "from django.contrib.auth import get_user_model; \
User=get_user_model(); \
User.objects.filter(username='admin').exists() or \
User.objects.create_superuser('admin', 'admin@example.com', 'admin123')"

echo "🔥 Запускаем Daphne (ASGI)..."
exec daphne -b 0.0.0.0 -p 8000 pet_project.asgi:application
