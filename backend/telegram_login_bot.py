# backend/telegram_login_bot.py
import os
import django
import hashlib
import hmac
from urllib.parse import quote
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pet_project.settings')
django.setup()

from django.conf import settings

BOT_TOKEN = os.getenv('TELEGRAM_LOGIN_BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("TELEGRAM_LOGIN_BOT_TOKEN не задан в .env")

FRONTEND_URL = 'https://petmarket.com.ru'
CALLBACK_URL = f'{FRONTEND_URL}/api/auth/telegram/callback/'


def generate_hash(data: dict, bot_token: str) -> str:
    """Генерирует хеш для проверки подлинности (как в официальном виджете)."""
    check_data = {k: v for k, v in data.items() if k != 'hash'}
    sorted_items = sorted(check_data.items())
    data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted_items)
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    return computed_hash


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    # Формируем данные для подписи
    data_for_hash = {
        'id': str(user.id),
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'username': user.username or '',
        'photo_url': f"https://t.me/i/userpic/320/{user.username}.jpg" if user.username else '',
        'auth_date': str(int(update.message.date.timestamp())),
    }

    # Генерируем хеш
    hash_sig = generate_hash(data_for_hash, BOT_TOKEN)

    # Формируем параметры для редиректа
    params = {
        'telegram_id': str(user.id),
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'username': user.username or '',
        'photo_url': f"https://t.me/i/userpic/320/{user.username}.jpg" if user.username else '',
        'hash': hash_sig,
    }

    # Кодируем параметры
    query_string = '&'.join([f"{k}={quote(str(v))}" for k, v in params.items() if v])
    full_url = f"{CALLBACK_URL}?{query_string}"

    # Отправляем кнопку
    await update.message.reply_text(
        f"Привет, {user.first_name}! Нажмите кнопку ниже для входа на PetMarket:",
        reply_markup={
            "inline_keyboard": [[{
                "text": "✅ Войти на PetMarket",
                "url": full_url
            }]]
        }
    )


def main():
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    print("Telegram Login Bot запущен...")
    application.run_polling()


if __name__ == "__main__":
    main()