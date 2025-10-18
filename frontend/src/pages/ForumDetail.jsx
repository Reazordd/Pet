import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import "../styles/ForumDetail.css";

function ForumDetail() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopic();
    fetchComments();
  }, [id]);

  const fetchTopic = async () => {
    try {
      const res = await api.get(`/forum/${id}/`);
      setTopic(res.data);
    } catch {
      toast.error("Тема не найдена");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/forum/${id}/comments/`);
      setComments(res.data);
    } catch {
      setComments([]);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/forum/${id}/like/`);
      setTopic({ ...topic, likes_count: res.data.likes });
    } catch {
      toast.error("Ошибка при лайке");
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/forum/${id}/add_comment/`, {
        text: newComment.trim(),
      });
      setComments([...comments, res.data]);
      setNewComment("");
    } catch {
      toast.error("Ошибка при добавлении комментария");
    }
  };

  if (loading) return <p className="loading">Загрузка...</p>;
  if (!topic) return <p className="error">Тема не найдена 😿</p>;

  return (
    <div className="forum-detail">
      <Link to="/forum" className="back-link">← Назад к форуму</Link>

      <div className="topic-card">
        <h1>{topic.title}</h1>
        <p className="topic-author">
          Автор:{" "}
          {topic.author ? (
            <Link to={`/seller/${topic.author.id}`}>
              {topic.author.username}
            </Link>
          ) : (
            "Аноним"
          )}
        </p>
        <p className="topic-content">{topic.content}</p>

        <div className="topic-actions">
          <button onClick={handleLike}>❤️ {topic.likes_count}</button>
          <span>💬 {topic.comments_count}</span>
        </div>
      </div>

      <div className="comments-section">
        <h2>Комментарии ({comments.length})</h2>

        {comments.length === 0 ? (
          <p>Пока нет комментариев 😺</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-avatar">
                {c.author?.avatar ? (
                  <img src={c.author.avatar} alt={c.author.username} />
                ) : (
                  "👤"
                )}
              </div>
              <div className="comment-body">
                <p className="comment-author">
                  {c.author?.username || "Гость"}
                </p>
                <p className="comment-text">{c.text}</p>
                <span className="comment-date">
                  {new Date(c.created_at).toLocaleString("ru-RU")}
                </span>
              </div>
            </div>
          ))
        )}

        <div className="comment-form">
          <textarea
            placeholder="Напишите комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleComment}>Отправить</button>
        </div>
      </div>
    </div>
  );
}

export default ForumDetail;
