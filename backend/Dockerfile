FROM python:3.11-slim

WORKDIR /app

# Устанавливаем зависимости для psycopg2 и сборки
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["gunicorn", "Pet.wsgi:application", "--bind", "0.0.0.0:8000"]
