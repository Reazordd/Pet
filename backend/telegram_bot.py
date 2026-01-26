# backend/telegram_bot.py
import os
import django
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from asgiref.sync import sync_to_async

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pet_project.settings')
django.setup()

from tgbot.models import TelegramSubscription
from ads.models import Pet

BOT_TOKEN = os.getenv('TELEGRAM_NOTIFY_BOT_TOKEN')

# Словарь для перевода видов
SPECIES_MAP = {
    'собака': 'dog',
    'кошка': 'cat',
    'птица': 'bird',
    'грызун': 'rodent',
    'рыба': 'fish',
    'рептилия': 'reptile',
    'другое': 'other',
}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Привет! Подпишись на уведомления:\n"
        "/subscribe <вид> <город> — подписка на категорию\n"
        "/subscribe all — все объявления\n"
        "Пример: /subscribe собака Симферополь"
    )


async def subscribe(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        args = context.args
        if not args or len(args) == 0:
            await update.message.reply_text("Используй: /subscribe <вид> <город> или /subscribe all")
            return

        telegram_id = update.effective_user.id

        # Подписка на ВСЕ объявления
        if args[0].lower() == 'all':
            await sync_to_async(TelegramSubscription.objects.update_or_create)(
                telegram_id=telegram_id,
                defaults={
                    'species': 'all',
                    'city': '',
                    'is_active': True
                }
            )
            await update.message.reply_text("✅ Подписка на ВСЕ объявления оформлена!")
            return

        # Подписка на категорию
        if len(args) < 2:
            await update.message.reply_text("Используй: /subscribe <вид> <город>")
            return

        species_input = args[0].lower()
        city = " ".join(args[1:]).title()
        species = SPECIES_MAP.get(species_input, species_input)

        await sync_to_async(TelegramSubscription.objects.update_or_create)(
            telegram_id=telegram_id,
            defaults={
                'species': species,
                'city': city,
                'is_active': True
            }
        )

        await update.message.reply_text(
            f"✅ Подписка оформлена!\n"
            f"Ты будешь получать уведомления о новых {species_input} в {city}."
        )
    except Exception as e:
        print(f"Ошибка подписки: {e}")
        await update.message.reply_text("Произошла ошибка. Попробуй позже.")


async def send_new_pets(context: ContextTypes.DEFAULT_TYPE):
    """Отправка НОВЫХ (ещё не отправленных) объявлений подписчикам"""
    from django.utils import timezone
    from datetime import timedelta

    try:
        # Получаем объявления за последние 24 часа, которые ещё не отправлены
        one_day_ago = timezone.now() - timedelta(days=1)
        new_pets = await sync_to_async(list)(
            Pet.objects.filter(
                created_at__gte=one_day_ago,
                notified_in_telegram=False  # ← ТОЛЬКО НЕ ОТПРАВЛЕННЫЕ
            ).exclude(moderation_status='rejected')
        )

        if not new_pets:
            return

        subscriptions = await sync_to_async(list)(
            TelegramSubscription.objects.filter(is_active=True)
        )

        for sub in subscriptions:
            filtered_pets = []

            if sub.species == 'all':
                filtered_pets = new_pets
            else:
                for pet in new_pets:
                    if (pet.species == sub.species and
                            pet.city.lower() == sub.city.lower()):
                        filtered_pets.append(pet)

            if not filtered_pets:
                continue

            # Отмечаем объявления как отправленные
            for pet in filtered_pets:
                pet.notified_in_telegram = True
                await sync_to_async(pet.save)(update_fields=['notified_in_telegram'])

            # Формируем сообщение
            message = "🆕 Новые объявления:\n\n"
            for pet in filtered_pets[:5]:
                price = f"{pet.price} ₽" if pet.price else "Договорная"
                status = "⏳ На модерации" if pet.moderation_status == 'pending' else "✅ Одобрено"
                # 🔥 ИСПРАВЛЕНО: убраны лишние пробелы в URL
                message += f"• {pet.name or pet.breed} — {price}\n"
                message += f"  {pet.city} | {status}\n"
                message += f"  https://petmarket.com.ru/pets/{pet.id}\n\n"

            try:
                await context.bot.send_message(
                    chat_id=sub.telegram_id,
                    text=message,
                    disable_web_page_preview=True
                )
            except Exception as e:
                print(f"Ошибка отправки уведомления: {e}")
                sub.is_active = False
                await sync_to_async(sub.save)()

    except Exception as e:
        print(f"Ошибка в send_new_pets: {e}")


def main():
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("subscribe", subscribe))

    if application.job_queue is not None:
        application.job_queue.run_repeating(
            send_new_pets,
            interval=60,  # каждую минуту для теста
            first=10
        )

    application.run_polling()


if __name__ == "__main__":
    main()