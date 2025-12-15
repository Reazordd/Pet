// frontend/src/components/ChatPreview.jsx
import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

function ChatPreview({ chat, onClick }) {
  const otherUser = chat.other_user;
  const lastMessagePreview = chat.last_message_preview;
  const lastMessageTime = chat.last_message_time;

  if (!otherUser) return null;

  return (
    <div
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-3"
      onClick={onClick}
    >
      {otherUser.avatar ? (
        <img
          src={otherUser.avatar}
          alt={otherUser.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="font-bold text-gray-700">{otherUser.username?.[0]?.toUpperCase() || '?'}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold truncate">{otherUser.username}</h3>
        <p className="text-gray-600 text-sm truncate">
          {lastMessagePreview || 'Нет сообщений'}
        </p>
      </div>
      {lastMessageTime && (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}

export default ChatPreview;