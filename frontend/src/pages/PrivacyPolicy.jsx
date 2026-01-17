// frontend/src/pages/PrivacyPolicy.jsx
import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Политика конфиденциальности</h1>

      <p className="text-sm text-gray-500 mb-6">
        Последнее обновление: 17 января 2026 г.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Общие положения</h2>
        <p>
          Настоящая Политика конфиденциальности регулирует порядок сбора, хранения, использования и защиты персональных данных пользователей сайта PetMarket (<a href="https://petmarket.com.ru" className="text-blue-600 hover:underline">https://petmarket.com.ru</a>).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Какую информацию мы собираем</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Персональные данные:</strong> имя, фамилия, email, номер телефона.</li>
          <li><strong>Данные аккаунта:</strong> аватар, биография, город проживания.</li>
          <li><strong>Объявления:</strong> фото, описание, порода, дата рождения питомца, цена.</li>
          <li><strong>Технические данные:</strong> IP-адрес, тип браузера, действия на сайте (просмотры, избранное).</li>
          <li><strong>Файлы cookie и аналоги:</strong> JWT-токен для аутентификации (хранится в localStorage).</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Цели обработки данных</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Регистрация и авторизация пользователей;</li>
          <li>Публикация и модерация объявлений о животных;</li>
          <li>Организация связи между покупателями и продавцами;</li>
          <li>Предотвращение мошенничества и спама;</li>
          <li>Улучшение функциональности сайта.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Хранение и защита данных</h2>
        <p>
          Ваши данные хранятся на серверах Timeweb Cloud (Российская Федерация) с использованием современных средств защиты. Пароли хранятся в зашифрованном виде. Мы не передаём ваши персональные данные третьим лицам, кроме случаев, прямо предусмотренных законодательством РФ.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Ваши права</h2>
        <p>
          Вы имеете право:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Получить информацию о том, какие данные о вас хранятся;</li>
          <li>Запросить исправление или удаление ваших данных;</li>
          <li>Отозвать согласие на обработку персональных данных (удалив аккаунт);</li>
          <li>Обжаловать действия оператора в уполномоченном органе.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Изменение политики</h2>
        <p>
          Мы оставляем за собой право обновлять настоящую Политику. Все изменения вступают в силу немедленно после публикации на сайте.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Контакты</h2>
        <p>
          По всем вопросам, связанным с обработкой персональных данных, обращайтесь на электронную почту:
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