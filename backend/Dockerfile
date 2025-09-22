FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Устанавливаем зависимости
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Копируем весь проект
COPY . /app

# Собираем статику (игнор ошибок, если DEBUG=True)
RUN python manage.py collectstatic --noinput || true

CMD ["gunicorn", "pet_project.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
