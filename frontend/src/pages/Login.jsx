// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api'; // ← ИСПОЛЬЗУЕМ СТАРЫЙ РАБОЧИЙ API
import { logout } from '../utils/auth';
import YandexLoginButton from '../components/YandexLoginButton';
import TelegramLoginButton from '../components/TelegramLoginButton';

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/token/', credentials);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      toast.success('Вход выполнен успешно!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.response?.status === 401) {
        toast.error('Неверный логин или пароль');
      } else {
        toast.error('Ошибка подключения к серверу');
      }
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Вход в систему</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Логин</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Введите ваш логин"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Введите ваш пароль"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        {/* Разделитель */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Или войдите через</span>
            </div>
          </div>

          {/* 🔥 КНОПКИ РЯДОМ */}
          <div className="mt-3 space-y-2">
            <YandexLoginButton />
            <TelegramLoginButton />
          </div>
        </div>

        <div className="auth-links mt-4 text-center">
          <p>
            Нет аккаунта?{' '}
            <Link to="/register" className="auth-link">
              Зарегистрироваться
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/password-reset" className="text-blue-600 hover:underline text-sm">
              Забыли пароль?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;