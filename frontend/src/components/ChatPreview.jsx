// frontend/src/components/ChatPreview.jsx
import React from 'react';
import { buildImageUrl } from '../utils/image';

function ChatPreview({ chat, onClick, onDelete }) {
  const petImage = chat.pet_image ? buildImageUrl(chat.pet_image) : null;
  const avatar = chat.other_user?.avatar ? buildImageUrl(chat.other_user.avatar) : null;
  const username = chat.other_user?.username || 'Пользователь';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'start',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Контейнер превью объявления */}
      <div style={{ position: 'relative', flexShrink: 0, width: '64px', height: '64px' }}>
        {petImage ? (
          <img
            src={petImage}
            alt="Объявление"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '16px',
              objectFit: 'cover'
            }}
            onError={(e) => (e.target.style.display = 'none')}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '16px',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🐾
          </div>
        )}

        {/* Аватар собеседника поверх */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid white',
          backgroundColor: 'white',
          overflow: 'hidden'
        }}>
          {avatar ? (
            <img
              src={avatar}
              alt="Аватар"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#374151'
            }}>
              {username[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      </div>

      {/* Информация */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <h4 style={{
            fontWeight: '600',
            color: '#111827',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{username}</h4>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat.id);
              }}
              style={{
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Удалить чат"
            >
              🗑️
            </button>
          )}
        </div>

        {chat.pet_title && (
          <p style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937',
            marginTop: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{chat.pet_title}</p>
        )}

        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          {chat.pet_price
            ? `${new Intl.NumberFormat('ru-RU').format(parseFloat(chat.pet_price))} ₽`
            : 'Цена не указана'}
        </p>

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginTop: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {chat.last_message_preview || 'Нет сообщений'}
        </p>
      </div>

      {chat.last_message_time && (
        <span style={{
          fontSize: '12px',
          color: '#9ca3af',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          marginLeft: '8px'
        }}>
          {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}

export default ChatPreview;