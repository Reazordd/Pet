// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../styles/Chat.css';

const ChatPage = () => {
  const { id } = useParams();
  const chatId = Number(id);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      // ✅ Убрали /chat/ — используем напрямую /:id/messages/
      const res = await api.get(`/${chatId}/messages/`);
      setMessages(res.data);
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
      toast.error('Не удалось загрузить сообщения');
    }
  };

  useEffect(() => {
    if (!id || isNaN(chatId) || chatId <= 0) {
      toast.error('Неверный ID чата');
      navigate('/messages');
      return;
    }
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    setLoading(true);
    try {
      // ✅ Убрали /chat/ — используем напрямую /:id/send/
      await api.post(`/${chatId}/send/`, { content });
      setInputValue('');
      loadMessages();
    } catch (err) {
      console.error('Ошибка отправки:', err.response?.data || err.message);
      toast.error('Не удалось отправить сообщение');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page max-w-2xl mx-auto p-4">
      <div className="chat-messages mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Нет сообщений</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.is_own ? 'message-own' : 'message-other'}`}
            >
              {msg.content}
              <div className="message-time">
                {new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Напишите сообщение..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputValue.trim()}>
          ↵
        </button>
      </form>
    </div>
  );
};

export default ChatPage;