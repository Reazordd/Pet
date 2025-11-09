# backend/Dockerfile


FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential gcc libpq-dev postgresql-client netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Копируем entrypoint-скрипт и даём ему права на исполнение
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Используем наш скрипт как команду запуска
CMD ["/app/entrypoint.sh"]
