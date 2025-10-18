import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import { toast } from "react-toastify";
import "../styles/Messages.css";

function Messages() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkToken()) {
      logout();
      return;
    }
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chats/");
      setChats(res.data.results ?? res.data);
    } catch (err) {
      toast.error("Не удалось загрузить чаты");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>Сообщения</h1>
      </div>

      {loading ? (
        <div>Загрузка...</div>
      ) : chats.length === 0 ? (
        <div className="empty-state">
          <h3>У вас пока нет диалогов</h3>
          <p>Перейдите на страницу объявления и нажмите «Написать продавцу»</p>
          <Link to="/" className="btn btn-primary">На главную</Link>
        </div>
      ) : (
        <div className="chat-list">
          {chats.map((c) => (
            <Link key={c.id} to={`/chat/${c.id}`} className="chat-item">
              <div className="chat-users">
                {c.users.map(u => u.username).join(", ")}
              </div>
              <div className="chat-last">
                {c.last_message ? `${c.last_message.sender.username}: ${c.last_message.text.slice(0, 60)}` : "Нет сообщений"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Messages;
