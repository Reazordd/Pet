// frontend/src/components/TelegramLoginButton.jsx
import React from 'react';

const TelegramLoginButton = () => {
  const handleLogin = () => {
    const botId = 'petmarket_login_bot';
    const redirectUrl = encodeURIComponent(`${window.location.origin}/api/auth/telegram/`);
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}&return_to=${redirectUrl}`;

    // Открываем окно авторизации
    window.open(authUrl, '_blank', 'width=500,height=600');
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        backgroundColor: '#0088cc',
        color: 'white',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: '500',
        height: '2.5rem',
        cursor: 'pointer',
        maxWidth: 'fit-content',
        margin: '0 auto'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#006699'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#0088cc'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.604 8.463c-.188.843-.94 2.5-1.188 3.375-.094.375-.188.75-.281 1.031-.188.75-.375 1.125-.375 1.313 0 .188.188.281.375.188.188-.094 1.125-.938 1.688-1.5.563-.563.938-1.031 1.125-1.313.188-.281.375-.281.563-.188.188.094.188.375.094.656-.188.75-1.313 2.813-2.25 5.25-.75 1.875-1.313 2.625-2.063 2.625-.563 0-1-.375-1.5-.844-.375-.375-1.5-1.5-2.625-2.813-1.5-1.875-2.5-3.375-2.625-3.656-.188-.375-.188-.656 0-.844.188-.188.375-.188.563-.188.188 0 .375.094.563.188.188.094 1.125 1.125 2.25 2.438.938 1.125 1.5 1.875 1.688 2.063.188.188.375.188.563.188.188 0 .375-.094.563-.188.188-.094 1.125-1.313 1.688-2.625.563-1.313.938-2.625 1.125-3.375.094-.75.094-1.313.094-1.5 0-.188-.094-.281-.188-.281-.094 0-.188.094-.281.281z"/>
      </svg>
      Войти через Telegram
    </button>
  );
};

export default TelegramLoginButton;