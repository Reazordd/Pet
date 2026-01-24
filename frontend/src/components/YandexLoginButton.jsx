// frontend/src/components/YandexLoginButton.jsx
import React from 'react';

const YANDEX_CLIENT_ID = '66ec70274ad44a78ae44f21ce89f9eee';
const REDIRECT_URI = import.meta.env.VITE_FRONTEND_URL + '/auth/yandex/callback';

const YandexLoginButton = () => {
  const handleLogin = () => {
    // 🔥 УБРАНЫ ЛИШНИЕ ПРОБЕЛЫ!
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        backgroundColor: '#dc2626',
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
      onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.999 8.23c-.002-.378-.22-.71-.554-.867l-10-4.76a1 1 0 00-1.445.867v15.54c0 .443.373.79.823.71l10-2a1 1 0 00.824-.71c.001-.002.002-.004.002-.006v-8.774zm-2.823 6.51l-6.66 1.333V8.43l6.66 3.172v2.138z"/>
      </svg>
      Войти через Яндекс
    </button>
  );
};

export default YandexLoginButton;