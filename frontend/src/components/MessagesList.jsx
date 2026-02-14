// frontend/src/components/MessagesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import ChatPreview from './ChatPreview';

function MessagesList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await api.get('/chat/list/');
        // 🔥 Сортировка по последнему сообщению (DESC)
        const sorted = [...res.data].sort((a, b) => {
          const timeA = a.last_message_time ? new Date(a.last_message_time) : new Date(0);
          const timeB = b.last_message_time ? new Date(b.last_message_time) : new Date(0);
          return timeB - timeA;
        });
        setChats(sorted);
      } catch (err) {
        console.error('Ошибка загрузки чатов:', err);
        toast.error('Не удалось загрузить сообщения');
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Удалить чат?')) return;
    try {
      await api.delete(`/chat/${chatId}/delete/`);
      setChats(chats.filter((c) => c.id !== chatId));
      toast.success('Чат удалён');
    } catch (err) {
      toast.error('Не удалось удалить чат');
    }
  };

  if (loading) return <p className="text-center mt-10 text-muted">Загрузка...</p>;

  if (chats.length === 0) {
    return <p className="text-muted text-center py-8">Нет активных диалогов</p>;
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <ChatPreview
          key={chat.id}
          chat={chat}
          onClick={() => navigate(`/chat/${chat.id}`)}
          onDelete={handleDeleteChat}
        />
      ))}
    </div>
  );
}

export default MessagesList;