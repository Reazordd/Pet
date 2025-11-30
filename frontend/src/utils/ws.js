// frontend/src/utils/ws.js
let ws = null;

export const connectWebSocket = (chatId, onMessage, onError, onClose) => {
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const host = window.location.host; // например, localhost:3000
  const wsUrl = `${protocol}${host.replace(':3000', ':8000')}/ws/chat/${chatId}/`;

  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    onError && onError(error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    onClose && onClose();
  };

  return ws;
};

export const sendMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ message }));
  } else {
    console.error('WebSocket is not connected');
  }
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};