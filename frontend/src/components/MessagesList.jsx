// frontend/src/components/MessagesList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FaUserCircle } from 'react-icons/fa';
import toast from 'react-toastify';

const MessagesList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/chat/list/');
        setChats(res.data || []);
      } catch (err) {
        console.error('Failed to load chats:', err);
        toast.error('Не удалось загрузить список сообщений');
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  if (loading) return <div className="p-4">Загрузка чатов...</div>;
  if (chats.length === 0) {
    return <div className="p-4 text-gray-500">У вас пока нет сообщений</div>;
  }

  return (
    <div className="space-y-3">
      {chats.map(chat => (
        <div
          key={chat.id}
          onClick={() => handleChatClick(chat.id)}
          className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
        >
          {chat.other_user?.avatar ? (
            <img
              src={chat.other_user.avatar}
              alt="Аватар"
              className="w-12 h-12 rounded-full object-cover mr-3"
            />
          ) : (
            <FaUserCircle className="text-gray-400 text-3xl mr-3" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <h4 className="font-semibold truncate">{chat.other_user?.username || 'Пользователь'}</h4>
              <span className="text-xs text-gray-500">
                {chat.last_message_time
                  ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {chat.last_message_preview || 'Нет сообщений'}
            </p>
          </div>

          {/* Онлайн-статус (заглушка) */}
          <div className="ml-2 w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      ))}
    </div>
  );
};

export default MessagesList;