// frontend/src/pages/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

function MessagesPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await api.get('/chat/list/'); // ✅
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

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Сообщения</h1>
      {chats.length === 0 ? (
        <p className="text-gray-500">Нет активных диалогов</p>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const other = chat.other_user;
            if (!other) return null;
            return (
              <Link
                key={chat.id}
                to={`/chat/${chat.id}`}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                {other.avatar ? (
                  <img src={other.avatar} alt="" className="w-12 h-12 rounded-full object-cover mr-3" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="font-bold">{other.username?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{other.username}</h3>
                  <p className="text-sm text-gray-600 truncate">{chat.last_message_preview || 'Нет сообщений'}</p>
                </div>
                {chat.last_message_time && (
                  <span className="text-xs text-gray-500">
                    {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </Link>
            );
          }).filter(Boolean)}
        </div>
      )}
    </div>
  );
}

export default MessagesPage;