// frontend/src/pages/PasswordResetRequest.jsx

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/password-reset/", { email });
      toast.success("Ссылка для сброса отправлена на почту!");
    } catch {
      toast.error("Ошибка: проверьте email.");
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
          Восстановление пароля
        </h2>
        <input
          type="email"
          placeholder="Введите ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-medium"
        >
          {loading ? "Отправка..." : "Отправить ссылку"}
        </button>
      </form>
    </div>
  );
}

export default PasswordResetRequest;
