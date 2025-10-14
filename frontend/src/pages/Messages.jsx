import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import "../styles/Messages.css";

function Messages() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkToken()) {
      toast.info("Авторизуйтесь, чтобы использовать сообщения");
      navigate("/login");
      return;
    }
    fetchChats();
  }, []);

  useEffect(() => {
    if (chatId) fetchMessages(chatId);
  }, [chatId]);

  const fetchChats = async () => {
    try {
      const res = await api.get("/messages/chats/");
      setChats(res.data);
    } catch {
      toast.error("Ошибка при загрузке чатов");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await api.get(`/messages/chats/${id}/`);
      setMessages(res.data.messages);
      setCurrentChat(res.data.chat);
    } catch {
      toast.error("Ошибка при загрузке сообщений");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const res = await api.post(`/messages/chats/${chatId}/send/`, {
        text: messageText,
      });
      setMessages((prev) => [...prev, res.data]);
      setMessageText("");
    } catch {
      toast.error("Ошибка при отправке сообщения");
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Список чатов */}
        <div className="chat-list">
          <div className="chat-list-header">💬 Мои чаты</div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <Link
                key={chat.id}
                to={`/messages/${chat.id}`}
                className={`chat-item ${
                  chat.id.toString() === chatId ? "active" : ""
                }`}
              >
                <div className="chat-avatar">
                  {chat.companion.avatar ? (
                    <img src={chat.companion.avatar} alt={chat.companion.username} />
                  ) : (
                    <div className="chat-placeholder">
                      {chat.companion.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="chat-info">
                  <h4>{chat.companion.first_name || chat.companion.username}</h4>
                  <p>{chat.last_message || "Нет сообщений"}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-chats">У вас пока нет чатов</div>
          )}
        </div>

        {/* Окно сообщений */}
        <div className="chat-window">
          {currentChat ? (
            <>
              <div className="chat-header">
                <h3>
                  🐾 {currentChat.companion.first_name || currentChat.companion.username}
                </h3>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.is_owner ? "message-own" : "message-other"
                    }`}
                  >
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <form className="chat-input" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Написать сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit">📨</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Выберите чат, чтобы начать общение</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
