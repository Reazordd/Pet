#!/bin/bash
set -e

echo "🚧 Остановка и очистка старых контейнеров..."
docker compose down --volumes --remove-orphans || true

echo "🧹 Очистка старых контейнеров, если остались..."
docker rm -f backend pet-db pet-frontend 2>/dev/null || true
docker volume prune -f

echo "🏗️ Пересборка контейнеров..."
docker compose build --no-cache

echo "🚀 Запуск контейнеров..."
docker compose up -d

echo "⏳ Ожидание запуска базы данных..."
sleep 5

echo "⚙️ Применение миграций..."
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

echo "👑 Создание суперпользователя (если нужно)..."
docker compose exec -it backend python manage.py createsuperuser || true

echo "✅ Готово! Проект перезапущен."
echo "🔗 Backend: http://localhost:8080/"
echo "🔗 Admin: http://localhost/admin/"
echo "🔗 Frontend: http://localhost/"


#   chmod +x reset.sh
#   ./reset.sh