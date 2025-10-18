import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import "../styles/Forum.css";

function ForumCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/forum/", form);
    navigate("/forum");
  };

  return (
    <div className="forum-create">
      <h1>Создать тему</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Заголовок"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Описание"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <button type="submit" className="btn btn-primary">Создать</button>
      </form>
    </div>
  );
}

export default ForumCreate;
