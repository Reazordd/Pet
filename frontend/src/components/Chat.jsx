// frontend/src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../utils/ws';

const Chat = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const onMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };

    const onError = (error) => {
      console.error('Chat error:', error);
    };

    const onClose = () => {
      console.log('Chat disconnected');
    };

    connectWebSocket(chatId, onMessage, onError, onClose);

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [chatId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}</strong>: {msg.message} <small>({msg.timestamp})</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Введите сообщение..."
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

export default Chat;