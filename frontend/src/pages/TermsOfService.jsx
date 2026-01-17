// frontend/src/pages/TermsOfService.jsx
import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Пользовательское соглашение</h1>

      <p className="text-sm text-gray-500 mb-6">
        Последнее обновление: 17 января 2026 г.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Общие положения</h2>
        <p>
          Настоящее Пользовательское соглашение (далее — Соглашение) регулирует условия использования веб-сайта PetMarket (<a href="https://petmarket.com.ru" className="text-blue-600 hover:underline">https://petmarket.com.ru</a>).
          Используя сайт, вы соглашаетесь с условиями настоящего Соглашения.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Права и обязанности пользователей</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Публиковать только достоверную информацию о животных;</li>
          <li>Не размещать контактные данные (WhatsApp, Telegram, телефон) в описании объявлений;</li>
          <li>Не использовать сайт для спама, мошенничества или незаконной деятельности;</li>
          <li>Гарантировать, что загружаемые фото являются вашей собственностью;</li>
          <li>Нести полную ответственность за содержание своих объявлений.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Права администрации</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Модерировать, редактировать или удалять объявления без предупреждения;</li>
          <li>Блокировать аккаунты за нарушение правил;</li>
          <li>Отказывать в публикации объявлений по своему усмотрению;</li>
          <li>Изменять настоящее Соглашение без уведомления.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Отказ от ответственности</h2>
        <p>
          Администрация сайта PetMarket не несёт ответственности за:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Сделки, совершённые между пользователями;</li>
          <li>Убытки, возникшие в результате использования сайта;</li>
          <li>Точность информации в объявлениях (проверяйте самостоятельно).</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Авторские права</h2>
        <p>
          Все материалы сайта (логотип, дизайн, тексты) принадлежат владельцам PetMarket.
          Копирование запрещено без письменного разрешения.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Контакты</h2>
        <p>
          По вопросам работы сайта обращайтесь на:
          <br />
          <strong className="text-blue-600">Reazordd@yandex.ru</strong>
        </p>
      </section>

      <div className="border-t pt-4 mt-8 text-sm text-gray-500">
        <p>© 2026 PetMarket. Все права защищены.</p>
      </div>
    </div>
  );
}