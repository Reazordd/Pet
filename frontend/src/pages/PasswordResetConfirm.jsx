// frontend/src/pages/PasswordResetConfirm.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function PasswordResetConfirm() {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/api/password-reset-confirm/${uidb64}/${token}/`, { password });
      toast.success("Пароль успешно изменён!");
      navigate("/login");
    } catch {
      toast.error("Ошибка: ссылка недействительна или устарела.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
          Новый пароль
        </h2>
        <input
          type="password"
          placeholder="Введите новый пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-medium"
        >
          {loading ? "Сохранение..." : "Сохранить пароль"}
        </button>
      </form>
    </div>
  );
}

export default PasswordResetConfirm;
