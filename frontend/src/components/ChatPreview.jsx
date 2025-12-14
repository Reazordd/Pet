// frontend/src/components/ChatPreview.jsx
import React from 'react';

function ChatPreview({ chat, onClick }) {
  const otherUser = chat.users?.find(u => u.id !== chat.current_user_id) || chat.users?.[0];
  const lastMessage = chat.messages?.length
    ? chat.messages[chat.messages.length - 1]
    : null;

  return (
    <div
      className="chat-preview p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-3"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
        {otherUser?.avatar ? (
          <img src={otherUser.avatar} alt={otherUser.username} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="font-bold text-gray-700">{otherUser?.username?.[0]?.toUpperCase() || '?'}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold truncate">{otherUser?.username || 'Пользователь'}</h3>
        {lastMessage && (
          <p className="text-gray-600 text-sm truncate">
            {lastMessage.is_own ? 'Вы: ' : ''}
            {lastMessage.content}
          </p>
        )}
      </div>
      {lastMessage && (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(lastMessage.created_at || lastMessage.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}
    </div>
  );
}

export default ChatPreview;