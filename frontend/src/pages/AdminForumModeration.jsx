// frontend/src/pages/AdminForumModeration.jsx

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import "../styles/global.css";




function AdminForumModeration() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/forum/moderation/");
      // ожидаем список объектов: { id, title, content, author: { id, username }, created_at, excerpt }
      setTopics(res.data || []);
    } catch (err) {
      console.error("fetchTopics err", err);
      toast.error("Не удалось загрузить очередь модерации.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Одобрить тему?")) return;
    setActionLoadingId(id);
    try {
      await api.post(`/forum/topics/${id}/approve/`);
      toast.success("Тема одобрена");
      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("approve err", err);
      toast.error("Ошибка при одобрении");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить тему навсегда?")) return;
    setActionLoadingId(id);
    try {
      await api.delete(`/forum/topics/${id}/`);
      toast.success("Тема удалена");
      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("delete err", err);
      toast.error("Ошибка при удалении");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderExcerpt = (text) => {
    if (!text) return "";
    const trimmed = text.length > 220 ? text.slice(0, 220) + "…" : text;
    return trimmed.replace(/\r?\n|\r/g, " ");
  };

  return (
    <div className="content admin-forum-moderation">
      <h1>Модерация форума</h1>

      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Очередь ожидания</h2>
          <div>
            <button className="btn" onClick={fetchTopics} disabled={loading}>
              {loading ? "Обновляем…" : "Обновить"}
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="center mt-12">Загрузка…</div>
          ) : topics.length === 0 ? (
            <div className="center mt-12">Очередь модерации пуста</div>
          ) : (
            <div className="moderation-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Тема</th>
                    <th style={{ width: "25%" }}>Автор / Дата</th>
                    <th style={{ width: "25%" }}>Превью</th>
                    <th style={{ width: "10%" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((t) => (
                    <tr key={t.id}>
                      <td className="topic-title">
                        <div className="title-text">{t.title}</div>
                        <div className="meta small muted">ID: {t.id}</div>
                      </td>
                      <td>
                        <div>{t.author?.username || "—"}</div>
                        <div className="small muted">{new Date(t.created_at).toLocaleString()}</div>
                      </td>
                      <td>
                        <div className="excerpt">{renderExcerpt(t.content)}</div>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn btn-approve"
                            onClick={() => handleApprove(t.id)}
                            disabled={actionLoadingId === t.id}
                            title="Одобрить"
                          >
                            ✅
                          </button>

                          <button
                            className="btn btn-delete"
                            onClick={() => handleDelete(t.id)}
                            disabled={actionLoadingId === t.id}
                            title="Удалить"
                            style={{ marginLeft: 8 }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminForumModeration;
