import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { getAccessToken, checkToken, logout } from "../utils/auth";
import { toast } from "react-toastify";
import "../styles/chat.css";

function ChatRoom() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");
  const wsRef = useRef(null);
  const scrollRef = useRef();

  useEffect(() => {
    if (!checkToken()) {
      logout();
      return;
    }
    fetchChat();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [id]);

  const fetchChat = async () => {
    try {
      const res = await api.get(`/chats/${id}/`);
      setChat(res.data);
    } catch {
      toast.error("Не удалось загрузить чат");
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chats/${id}/messages/`);
      setMessages(res.data);
      scrollToBottom();
    } catch {
      toast.error("Не удалось загрузить сообщения");
    }
  };

  const connectWS = () => {
    const token = getAccessToken();
    if (!token) return;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const wsUrl = `${protocol}://${host.replace(/:\d+$/, ":8000")}/ws/chat/${id}/?token=${token}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message" && data.message) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
      } catch (err) {
        console.error(err);
      }
    };
  };

  const sendMessage = async () => {
    const msg = text.trim();
    if (!msg) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", text: msg }));
      setText("");
      return;
    }
    try {
      const res = await api.post(`/chats/${id}/send/`, { text: msg });
      setMessages((prev) => [...prev, res.data]);
      setText("");
      scrollToBottom();
    } catch {
      toast.error("Ошибка отправки сообщения");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>{chat?.title || "Диалог"}</h1>
        <Link to="/messages" className="btn btn-secondary">Назад</Link>
      </div>

      <div className="chat-box" ref={scrollRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-message ${
              m.sender?.username === chat?.current_user ? "own" : ""
            }`}
          >
            <div className="msg-header">
              <span className="msg-sender">{m.sender?.username}</span>
              <span className="msg-time">
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="msg-text">{m.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          placeholder="Напишите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Отправить</button>
      </form>
    </div>
  );
}

export default ChatRoom;
