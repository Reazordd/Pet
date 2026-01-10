#!/bin/bash
set -euo pipefail

echo "➡️ Starting PetMarket deployment..."

# Активируем virtualenv (если используется)
# source /path/to/venv/bin/activate

# Переходим в backend
cd backend

# Устанавливаем зависимости
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Применяем миграции
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Создаём суперпользователя (если нужно)
if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ]; then
    echo "👤 Ensuring superuser exists..."
    python manage.py create_superuser_if_not_exists
fi

# Собираем статику
echo "📂 Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "✅ Deployment completed!"