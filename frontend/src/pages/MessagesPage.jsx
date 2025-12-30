// frontend/src/pages/MessagesPage.jsx
import React from 'react';
import MessagesList from '../components/MessagesList';

function MessagesPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Сообщения</h1>
      <MessagesList />
    </div>
  );
}

export default MessagesPage;