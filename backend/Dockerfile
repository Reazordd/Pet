# --- Stage 1: base Python ---
FROM python:3.11-slim AS base

# Устанавливаем только необходимое для Django + PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Устанавливаем зависимости Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Stage 2: prod image ---
FROM python:3.11-slim

# Копируем зависимости из base-слоя
COPY --from=base /usr/local /usr/local

WORKDIR /app
COPY . .

# Запускаем gunicorn сервер
CMD ["gunicorn", "pet_project.wsgi:application", "--bind", "0.0.0.0:8000"]
