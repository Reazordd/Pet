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
        setChats(res.data || []);
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

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  if (chats.length === 0) {
    return <p className="text-gray-500">Нет активных диалогов</p>;
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