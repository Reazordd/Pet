// frontend/src/pages/PasswordResetRequest.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api"; // ← ИСПОЛЬЗУЕМ ТВОЙ api.js

function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🔥 ПРАВИЛЬНЫЙ ЭНДПОИНТ
      await api.post('/auth/password/reset/', { email });
      toast.success("Ссылка для сброса отправлена на почту!");
      navigate('/login');
    } catch {
      toast.error("Ошибка: проверьте email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Восстановление пароля</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading ? "Отправка..." : "Отправить ссылку"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login" className="auth-link">
            Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordResetRequest;