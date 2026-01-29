# backend/telegram_login_bot.py
import os
import django
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pet_project.settings')
django.setup()

from django.conf import settings
from urllib.parse import quote

BOT_TOKEN = os.getenv('TELEGRAM_LOGIN_BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("TELEGRAM_LOGIN_BOT_TOKEN не задан в .env")

FRONTEND_URL = 'https://petmarket.com.ru'
CALLBACK_URL = f'{FRONTEND_URL}/api/auth/telegram/callback/'


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user

    # Формируем параметры для редиректа
    params = {
        'telegram_id': str(user.id),
        'first_name': user.first_name or '',
        'last_name': user.last_name or '',
        'username': user.username or '',
        'photo_url': f"https://t.me/i/userpic/320/{user.username}.jpg" if user.username else '',
        'hash': 'valid_hash'  # Для MVP можно доверять данным от бота
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