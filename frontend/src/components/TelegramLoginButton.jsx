// frontend/src/components/TelegramLoginButton.jsx
import React, { useEffect } from 'react';

const TelegramLoginButton = () => {
  useEffect(() => {
    // Удаляем старый скрипт при повторном монтировании
    const existingScript = document.querySelector('script[src*="telegram-widget"]');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'petmarket_login_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-auth-url', 'https://petmarket.com.ru/api/auth/telegram/');

    script.onerror = () => {
      console.error('Не удалось загрузить Telegram Login Widget');
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '1rem auto' }}>
      <div id="telegram-login-button-placeholder">
        Загрузка кнопки входа через Telegram...
      </div>
    </div>
  );
};

export default TelegramLoginButton;