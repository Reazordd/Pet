FROM python:3.11-slim

# Устанавливаем зависимости для psycopg2 и сборки пакетов
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем requirements
COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

# Копируем проект
COPY . /app

# Собираем статику (чтобы не забыть)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["gunicorn", "pet_project.wsgi:application", "--bind", "0.0.0.0:8000"]

