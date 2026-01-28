// frontend/src/components/TelegramLoginButton.jsx
import React, { useEffect, useRef } from 'react';

const TelegramLoginButton = () => {
  const containerRef = useRef(null);
  const isProduction = window.location.hostname === 'petmarket.com.ru';

  useEffect(() => {
    if (!isProduction || !containerRef.current) return;

    // Удаляем старые скрипты и iframes Telegram
    const oldScripts = document.querySelectorAll('script[src*="telegram-widget"]');
    oldScripts.forEach(script => script.remove());

    const oldIframes = document.querySelectorAll('iframe[src*="oauth.telegram.org"], iframe[id*="telegram-login"]');
    oldIframes.forEach(iframe => iframe.remove());

    // 🔥 КРИТИЧЕСКИ ВАЖНО: используем ЧИСЛОВОЙ идентификатор бота (не имя!)
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', '8518062763'); // ← ЧИСЛО из токена: 8518062763:AAFULxKVOQKbTXNRX9TrfxwIyuKm-hS7Ba0
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-auth-url', 'https://petmarket.com.ru/api/auth/telegram/');

    script.onerror = () => console.error('Не удалось загрузить Telegram Login Widget');

    // Вставляем скрипт ВНУТРЬ контейнера компонента (не в конец body!)
    containerRef.current.appendChild(script);

    return () => {
      // Очистка при размонтировании
      if (script.parentNode) script.parentNode.removeChild(script);

      // Дополнительная очистка всех следов Telegram
      document.querySelectorAll('script[src*="telegram-widget"]').forEach(el => el.remove());
      document.querySelectorAll('iframe[src*="oauth.telegram.org"]').forEach(el => el.remove());
    };
  }, [isProduction]);

  if (!isProduction) {
    return (
      <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#666' }}>
        Вход через Telegram доступен только на основном сайте
      </div>
    );
  }

  // Контейнер для кнопки (скрипт вставится сюда → кнопка появится здесь)
  return <div ref={containerRef} style={{ textAlign: 'center', margin: '0.5rem 0' }} />;
};

export default TelegramLoginButton;