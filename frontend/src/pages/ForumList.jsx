// frontend/src/pages/ForumList.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api.js";
import "../styles/Forum.css";

function ForumList() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    api.get("/forum/").then((res) => setTopics(res.data));
  }, []);

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Форум 🗣</h1>
        <Link to="/forum/create" className="btn btn-primary">Создать тему</Link>
      </div>

      <div className="forum-list">
        {topics.map((t) => (
          <Link key={t.id} to={`/forum/${t.id}`} className="forum-card">
            <h3>{t.title}</h3>
            <p className="forum-author">Автор: {t.author.username}</p>
            <div className="forum-stats">
              ❤️ {t.likes_count} 💬 {t.comments_count} 👁 {t.views}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ForumList;
