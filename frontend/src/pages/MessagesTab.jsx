// frontend/src/pages/MessagesTab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import ChatPreview from '../components/ChatPreview';

function MessagesTab() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      try {
        // ✅ Исправлено: /list/ вместо /chat/list/
        const res = await api.get('/list/');
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

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (chats.length === 0) return <p className="text-gray-500">У вас пока нет сообщений.</p>;

  return (
    <div className="messages-tab space-y-3">
      <h2 className="text-xl font-semibold">Сообщения</h2>
      <div className="space-y-3">
        {chats.map((chat) => (
          <ChatPreview
            key={chat.id}
            chat={chat}
            onClick={() => navigate(`/chat/${chat.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default MessagesTab;