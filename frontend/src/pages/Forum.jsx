import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "../styles/Forum.css";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get("/forum/");
      setPosts(res.data);
    } catch {
      setPosts([]);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    const res = await api.post("/forum/", newPost);
    setPosts([res.data, ...posts]);
    setNewPost({ title: "", content: "" });
  };

  const handleLike = async (id) => {
    const res = await api.post(`/forum/${id}/like/`);
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, likes_count: res.data.likes } : p
      )
    );
  };

  return (
    <div className="forum-page">
      <div className="forum-header">
        <h1>Форум 🗣</h1>
      </div>

      <div className="forum-create">
        <input
          placeholder="Заголовок темы"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Опишите тему..."
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <button onClick={handleCreatePost} className="btn btn-primary">
          Опубликовать
        </button>
      </div>

      <div className="forum-list">
        {posts.length === 0 ? (
          <p>Нет обсуждений 😿</p>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="forum-card">
              <h3>{p.title}</h3>
              <p>{p.content}</p>
              <div className="forum-footer">
                <span>Автор: {p.author?.username}</span>
                <div>
                  <button onClick={() => handleLike(p.id)}>❤️ {p.likes_count}</button>
                  <span>💬 {p.comments_count}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;
