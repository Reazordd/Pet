// frontend/src/components/ChatButton.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { checkToken } from '../utils/auth';
import { toast } from 'react-toastify';
import '../styles/ChatButton.css';

function ChatButton({ otherUserId, className = '' }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openChat = async () => {
    if (!checkToken()) {
      toast.info('Войдите, чтобы написать продавцу');
      navigate('/login');
      return;
    }
    if (!otherUserId) {
      toast.error('Неверный пользователь');
      return;
    }

    try {
      setLoading(true);

      // ✅ Исправлено: вызываем /chat/create/ (без /api/api/...)
      const res = await api.post('/chat/create/', {
        users: [otherUserId]
      });
      const chatId = res.data.id;
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.detail) toast.error(err.response.data.detail);
      else toast.error('Не удалось открыть чат');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`chat-button ${className}`}
      onClick={openChat}
      disabled={loading}
      title="Написать продавцу"
    >
      {loading ? '...' : '💬 Написать'}
    </button>
  );
}

export default ChatButton;