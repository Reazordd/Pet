// frontend/src/pages/PasswordResetConfirm.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api"; // ← ИСПОЛЬЗУЕМ ТВОЙ api.js

function PasswordResetConfirm() {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }
    setLoading(true);
    try {
      // 🔥 ПРАВИЛЬНЫЙ ЭНДПОИНТ
      await api.post(`/auth/password/reset/${uidb64}/${token}/`, { password });
      toast.success("Пароль успешно изменён!");
      navigate("/login");
    } catch (error) {
      console.error('Reset error:', error);
      toast.error("Ошибка: ссылка недействительна или устарела.");
      navigate("/password-reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Новый пароль</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="password"
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading ? "Сохранение..." : "Сохранить пароль"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetConfirm;