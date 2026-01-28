// frontend/src/components/TelegramLoginButton.jsx
import React, { useEffect } from 'react';

const TelegramLoginButton = () => {
  const isProduction = window.location.hostname === 'petmarket.com.ru';

  useEffect(() => {
    if (!isProduction) return;

    // Удаляем ВСЁ, что связано с Telegram
    const oldScript = document.querySelector('script[src*="telegram-widget"]');
    if (oldScript) oldScript.remove();

    const oldIframe = document.querySelector('iframe[src*="oauth.telegram.org"]');
    if (oldIframe) oldIframe.remove();

    // Создаём НОВЫЙ скрипт — БЕЗ ПРОБЕЛОВ!
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22'; // ← убраны пробелы
    script.setAttribute('data-telegram-login', 'petmarket_login_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-auth-url', 'https://petmarket.com.ru/api/auth/telegram/'); // ← убраны пробелы

    script.onerror = () => console.error('Не удалось загрузить Telegram Login Widget');
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [isProduction]);

  if (!isProduction) {
    return (
      <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#666' }}>
        Вход через Telegram доступен только на основном сайте
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
      <div id="telegram-login-button-placeholder" style={{ display: 'none' }} />
    </div>
  );
};

export default TelegramLoginButton;