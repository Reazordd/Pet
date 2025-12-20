// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Lightbox from '../components/Lightbox';
import '../styles/Chat.css'; // ← убедись, что подключён CSS

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

  useEffect(() => {
    if (!id || isNaN(chatId) || chatId <= 0) {
      toast.error('Неверный ID чата');
      navigate('/messages');
      return;
    }
    loadMessages();
    fetchOtherUser();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSend = async (e) => {
    e.preventDefault();
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openLightbox = (src) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {otherUser && (
        <div className="mb-3 text-center">
          <Link
            to={`/profile/${otherUser.id}`}
            className="text-blue-600 hover:underline font-medium text-lg"
          >
            {otherUser.username}
          </Link>
        </div>
      )}

      <div className="mb-4 h-96 overflow-y-auto border rounded-lg p-3 bg-white">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Нет сообщений</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 ${msg.is_own ? 'text-right' : 'text-left'}`}
            >
              {/* Аватар + имя собеседника */}
              {!msg.is_own && otherUser && (
                <Link
                  to={`/profile/${otherUser.id}`}
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-1"
                >
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.username}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                      {otherUser.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span>{otherUser.username}</span>
                </Link>
              )}

              {/* Фото */}
              {msg.file_url ? (
                <div
                  className={`inline-block max-w-xs cursor-pointer ${msg.is_own ? 'ml-auto' : 'mr-auto'}`}
                  onClick={() => openLightbox(msg.file_url)}
                >
                  <img
                    src={msg.file_url}
                    alt="Фото"
                    className="rounded-lg border chat-image" // ← используем CSS-класс
                  />
                </div>
              ) : null}

              {/* Текст */}
              {msg.content ? (
                <div
                  className={`inline-block p-2 rounded-lg max-w-xs ${
                    msg.is_own
                      ? 'bg-blue-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              ) : null}

              {/* Время */}
              <div
                className={`text-xs text-gray-500 mt-1 ${
                  msg.is_own ? 'text-right' : 'text-left'
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {lightboxImage && (
        <Lightbox
          src={lightboxImage}
          alt="Фото из чата"
          onClose={closeLightbox}
        />
      )}

      <form onSubmit={handleSend} className="flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
            <span className="text-sm truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 border rounded px-3 py-2"
            disabled={loading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleFileClick}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            📎
          </button>
          <button
            type="submit"
            disabled={loading || (!inputValue.trim() && !selectedFile)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;