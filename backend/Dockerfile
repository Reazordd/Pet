FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Устанавливаем системные зависимости для сборки некоторых пакетов (psycopg2 и т.п.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Копируем только requirements и ставим зависимости сначала
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Копируем весь проект
COPY . /app

# убедиться, что модуль проекта импортируется: добавим PYTHONPATH
ENV PYTHONPATH=/app

# Если ваш проект называется не Pet, поменяйте Pet.wsgi на <yourproject>.wsgi
CMD ["gunicorn", "Pet.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--log-level", "info"]
