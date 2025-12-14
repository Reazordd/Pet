// frontend/src/pages/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import '../styles/Messages.css';

function MessagesPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decoded = jwtDecode(token);
        return Number(decoded.user_id);
      }
    } catch (e) {
      console.warn('Invalid token');
    }
    return null;
  };

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await api.get('/list/');
      setChats(res.data || []);
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
      toast.error('Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  const currentUserId = getCurrentUserId();

  return (
    <div className="messages-page p-4">
      <div className="messages-container max-w-4xl mx-auto bg-white rounded-xl shadow">
        <div className="chat-list">
          <div className="chat-list-header p-4 font-bold text-lg border-b">Сообщения</div>
          {chats.length === 0 ? (
            <div className="no-chats p-8 text-center text-gray-500">Нет активных диалогов</div>
          ) : (
            chats.map((chat) => {
              // Определяем собеседника
              const otherUser = chat.users?.find(u => u.id !== currentUserId) || chat.users?.[0];
              const lastMsg = chat.messages?.length
                ? chat.messages[chat.messages.length - 1]
                : null;

              if (!otherUser) return null;

              return (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  className="chat-item flex items-center gap-3 p-4 border-b hover:bg-gray-50"
                >
                  <div className="chat-avatar w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {otherUser.avatar ? (
                      <img src={otherUser.avatar} alt={otherUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-gray-700">
                        {otherUser.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="chat-info flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{otherUser.username || 'Пользователь'}</h4>
                    {lastMsg && (
                      <p className="text-gray-600 text-sm truncate">{lastMsg.content}</p>
                    )}
                  </div>
                  {lastMsg && (
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(lastMsg.created_at || lastMsg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </Link>
              );
            }).filter(Boolean)
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;