FROM python:3.11-slim

WORKDIR /app

# Устанавливаем зависимости для psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Копируем код
COPY . /app/

# Собираем статику
RUN python manage.py collectstatic --noinput || true

# Запускаем gunicorn
CMD ["gunicorn", "Pet.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
