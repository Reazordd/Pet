// frontend/src/pages/ChatPage.jsx
import React, { useState } from 'react';
import Chat from '../components/Chat';

const ChatPage = () => {
  const [chatId, setChatId] = useState('');

  return (
    <div>
      <h1>Чат</h1>
      <input
        type="number"
        placeholder="Введите ID чата"
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
      />
      {chatId && <Chat chatId={parseInt(chatId)} />}
    </div>
  );
};

export default ChatPage;