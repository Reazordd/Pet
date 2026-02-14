// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Lightbox from '../components/Lightbox';
import { buildImageUrl } from '../utils/image';
import '../styles/Chat.css';
import '../styles/Avatar.css';

const ChatPage = () => {
  const { id } = useParams();
  const chatId = Number(id);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${chatId}/messages/`);
      setMessages(res.data);
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
      toast.error('Не удалось загрузить сообщения');
    }
  };

  const fetchOtherUser = async () => {
    try {
      const res = await api.get(`/chat/${chatId}/`);
      const other = res.data.other_user;
      setOtherUser(other);
    } catch (err) {
      console.warn('Не удалось загрузить данные собеседника');
    }
  };

  // 🔥 ИСПРАВЛЕНО: вызываем markAsRead ПОСЛЕ загрузки сообщений
  const markAsRead = async () => {
    try {
      // Получаем актуальные сообщения из состояния
      const currentMessages = messages.length > 0 ? messages : await api.get(`/chat/${chatId}/messages/`).then(res => res.data);
      const hasUnread = currentMessages.some(msg => !msg.is_own && !msg.is_read);
      if (hasUnread) {
        await api.post(`/chat/${chatId}/mark-read/`);
        // Обновляем локально
        setMessages(prev => prev.map(m =>
          !m.is_own ? { ...m, is_read: true } : m
        ));
      }
    } catch (err) {
      console.warn('Не удалось отметить как прочитанное', err);
    }
  };

  useEffect(() => {
    if (!id || isNaN(chatId) || chatId <= 0) {
      toast.error('Неверный ID чата');
      navigate('/messages');
      return;
    }

    // Загружаем и помечаем как прочитанное
    const initChat = async () => {
      await loadMessages();
      await fetchOtherUser();
      markAsRead(); // ← Теперь работает корректно
    };

    initChat();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Можно отправлять только изображения (jpg, png и т.д.)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Файл слишком большой (макс. 5 МБ)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = async () => {
    const content = inputValue.trim();
    const file = selectedFile;

    if (!content && !file) {
      toast.warn('Введите текст или выберите фото');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    try {
      await api.post(`/chat/${chatId}/send/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInputValue('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadMessages();
    } catch (err) {
      console.error('Ошибка отправки:', err.response?.data || err.message);
      toast.error('Не удалось отправить сообщение');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const openLightbox = (src) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="chat-container">
      {/* Заголовок чата */}
      {otherUser && (
        <div className="chat-header">
          {otherUser.avatar ? (
            <img
              src={buildImageUrl(otherUser.avatar)}
              alt={otherUser.username}
              className="avatar-xs"
            />
          ) : (
            <div className="avatar-xs bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
              {otherUser.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <h2>
            <Link
              to={`/profile/${otherUser.id}`}
              className="text-blue-400 hover:text-blue-300"
            >
              {otherUser.username}
            </Link>
          </h2>
        </div>
      )}

      {/* Сообщения */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Нет сообщений</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.is_own ? 'message-own' : 'message-other'} ${
                msg.is_own && msg.is_read ? 'is-read' : ''
              }`}
            >
              {!msg.is_own && otherUser && (
                <div className="sender-name">
                  {otherUser.avatar ? (
                    <img
                      src={buildImageUrl(otherUser.avatar)}
                      alt={otherUser.username}
                      className="avatar-xs"
                    />
                  ) : (
                    <div className="avatar-xs bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                      {otherUser.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span>{otherUser.username}</span>
                </div>
              )}

              {msg.file_url && (
                <div
                  className="chat-image"
                  onClick={() => openLightbox(buildImageUrl(msg.file_url))}
                >
                  <img
                    src={buildImageUrl(msg.file_url)}
                    alt="Фото"
                    className="rounded-lg"
                  />
                </div>
              )}

              {msg.content && <div>{msg.content}</div>}

              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Лайтбокс */}
      {lightboxImage && (
        <Lightbox
          src={lightboxImage}
          alt="Фото из чата"
          onClose={closeLightbox}
        />
      )}

      {/* Форма ввода */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            disabled={loading}
            className="chat-input-field"
            rows="1"
            style={{
              resize: 'none',
              overflowY: 'hidden',
              maxHeight: '120px',
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            aria-hidden="true"
            tabIndex="-1"
          />
          <button
            type="button"
            onClick={handleFileClick}
            disabled={loading}
            aria-label="Прикрепить файл"
            className="attach-btn"
          >
            📎
          </button>
          <button
            onClick={handleSend}
            disabled={loading || (!inputValue.trim() && !selectedFile)}
            className="send-btn"
            aria-label="Отправить"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;