# Используем официальный образ Python 3.12
FROM python:3.12-slim

# Устанавливаем системные зависимости
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Создаём пользователя
RUN groupadd --gid 2000 app && useradd --uid 2000 --gid 2000 -m -d /app app

# Обновляем pip
RUN pip install --no-cache-dir --upgrade pip

# Устанавливаем Django 5.1.4 СРАЗУ
RUN pip install --no-cache-dir "Django==5.1.4"

# Копируем зависимости
WORKDIR /app
COPY --chown=app:app backend/requirements.txt .
# Удаляем строку с Django из requirements.txt перед установкой
RUN sed -i '/Django==/d' requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY --chown=app:app . .

# Переключаемся на пользователя
USER app

# Запускаем миграции и Gunicorn
CMD ["sh", "-c", "cd backend && python manage.py migrate --noinput && gunicorn pet_project.wsgi:application"]