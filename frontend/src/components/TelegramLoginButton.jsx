// frontend/src/components/TelegramLoginButton.jsx
import React, { useEffect } from 'react';

const TelegramLoginButton = () => {
  const isProduction = window.location.hostname === 'petmarket.com.ru';

  useEffect(() => {
    if (!isProduction) return;

    // Удаляем старый скрипт, если есть
    const existingScript = document.querySelector('script[src*="telegram-widget"]');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'petmarket_login_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-request-access', 'write');

    // 🔥 ВАЖНО: data-auth-url должен быть ЧИСТЫМ — без пробелов и GET-параметров!
    const apiUrl = import.meta.env.VITE_API_URL || 'https://petmarket.com.ru';
    script.setAttribute('data-auth-url', `${apiUrl}/api/auth/telegram/`);

    script.onerror = () => console.error('Не удалось загрузить Telegram Login Widget');
    document.body.appendChild(script);

    // Выравнивание кнопки после загрузки
    const adjustButton = () => {
      const btn = document.querySelector('.tgui_widget_login_button');
      if (btn) {
        btn.style.display = 'inline-flex';
        btn.style.justifyContent = 'center';
        btn.style.width = 'auto';
        btn.style.maxWidth = '100%';
        btn.style.margin = '0 auto';
      }
    };

    const interval = setInterval(adjustButton, 300);
    setTimeout(() => clearInterval(interval), 5000);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      clearInterval(interval);
    };
  }, [isProduction]);

  if (!isProduction) {
    return (
      <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#666' }}>
        Вход через Telegram доступен только на основном сайте
      </div>
    );
  }

  // Рендерим placeholder — Telegram сам вставит кнопку внутрь body
  return (
    <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
      <div id="telegram-login-button-placeholder" style={{ display: 'none' }} />
    </div>
  );
};

export default TelegramLoginButton;