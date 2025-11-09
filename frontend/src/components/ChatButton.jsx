// D:\Pet\frontend\src\components\ChatButton.jsx

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
      // Создаём или получаем чат с пользователем — API ожидает { receiver_id }
      const res = await api.post('/chats/', { receiver_id: otherUserId });
      const chat = res.data;
      // У API можем получить либо chat object, либо { id: ... }
      const chatId = chat.id || (chat.data && chat.data.id);
      if (!chatId && chatId !== 0) {
        // если вернулся сериализованный объект с id в другом поле
        const foundId = chat?.id || chat?.pk || (Array.isArray(chat) && chat[0]?.id);
        if (foundId) {
          navigate(`/chat/${foundId}`);
          return;
        }
        toast.error('Не удалось получить id чата');
        return;
      }
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
