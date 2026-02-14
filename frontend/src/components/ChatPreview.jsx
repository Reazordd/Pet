// frontend/src/components/ChatPreview.jsx
import React from 'react';
import { buildImageUrl } from '../utils/image';
import { formatRelativeDateTime } from '../utils/date';

function ChatPreview({ chat, onClick, onDelete }) {
  const petImage = chat.pet_image ? buildImageUrl(chat.pet_image) : null;
  const avatar = chat.other_user?.avatar ? buildImageUrl(chat.other_user.avatar) : null;
  const username = chat.other_user?.username || 'Пользователь';
  const unreadCount = chat.unread_count || 0;

  return (
    <div onClick={onClick} className="chat-preview-item">
      {/* Превью объявления */}
      <div className="chat-preview-image">
        {petImage ? (
          <img src={petImage} alt="Объявление" onError={(e) => (e.target.style.display = 'none')} />
        ) : (
          <div className="chat-preview-placeholder">🐾</div>
        )}

        {/* Аватар поверх */}
        {avatar ? (
          <img src={avatar} alt="Аватар" className="chat-preview-avatar" />
        ) : (
          <div className="chat-preview-avatar-placeholder">
            {username[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="chat-preview-info">
        <div className="chat-preview-header">
          <h4 className="chat-preview-username">{username}</h4>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat.id);
              }}
              className="chat-preview-delete"
              title="Удалить чат"
            >
              🗑️
            </button>
          )}
        </div>

        {chat.pet_title && (
          <p className="chat-preview-pet-title">{chat.pet_title}</p>
        )}

        <p className="chat-preview-price">
          {chat.pet_price
            ? `${new Intl.NumberFormat('ru-RU').format(parseFloat(chat.pet_price))} ₽`
            : 'Цена не указана'}
        </p>

        <p className="chat-preview-last-message">
          {chat.last_message_preview || 'Нет сообщений'}
        </p>
      </div>

      {/* Правая колонка: время + unread badge */}
      <div className="chat-preview-meta">
        {chat.last_message_time && (
          <span className="chat-preview-time">
            {formatRelativeDateTime(new Date(chat.last_message_time))}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="chat-preview-unread-badge">{unreadCount}</span>
        )}
      </div>
    </div>
  );
}

export default ChatPreview;