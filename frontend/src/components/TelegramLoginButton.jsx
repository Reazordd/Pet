// frontend/src/components/TelegramLoginButton.jsx
import React from 'react';

const TELEGRAM_BOT_NAME = 'petmarket_login_bot';

const TelegramLoginButton = () => {
  const handleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // Генерируем уникальный state для защиты от CSRF
    const state = Date.now().toString();

    const authUrl = `https://t.me/${TELEGRAM_BOT_NAME}?start=auth_${state}`;

    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`;
    window.open(authUrl, 'TelegramAuth', features);
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="btn btn-secondary"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        backgroundColor: '#0088cc',
        color: 'white',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.739 16.5c-.162.375-.63.525-1.005.337l-2.25-1.425-1.05.975c-2.7 2.475-5.55 2.4-6.3-.075-.15-.45.075-.9.45-1.05l2.85-2.25-1.35-4.2c-.15-.45.15-.9.6-.9h3.6c.3 0 .525.15.675.375l1.5 3.15 3.45-2.1c.45-.225.9-.075 1.05.45l1.05 4.5c.15.6-.3.975-.9.975l-4.2-.3 1.05 3.6c.075.3-.075.675-.45.825z"/>
      </svg>
      Войти через Telegram
    </button>
  );
};

export default TelegramLoginButton;