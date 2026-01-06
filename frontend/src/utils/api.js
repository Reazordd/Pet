// frontend/src/utils/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Accept": "application/json",
  },
});

// 🔥 ПОЛНЫЙ СПИСОК ПУБЛИЧНЫХ ЭНДПОИНТОВ (без авторизации)
const PUBLIC_ENDPOINTS = [
  // Аутентификация
  '/token/',
  '/token/refresh/',

  // Регистрация и активация
  '/auth/register/',
  '/auth/activate/',

  // Сброс пароля
  '/auth/password/reset/',
  '/auth/password/reset/', // дубль для путей с параметрами

  // Публичные данные
  '/categories/',
  '/breeds/',
  '/pets/', // список объявлений (публичный просмотр)

  // Детали объявления (публичный просмотр)
  '/pets/',
];

api.interceptors.request.use((config) => {
  // Проверяем, является ли URL публичным
  const isPublic = PUBLIC_ENDPOINTS.some(endpoint =>
    config.url?.startsWith(endpoint)
  );

  // Добавляем токен ТОЛЬКО для непубличных запросов
  if (!isPublic) {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Обработка ошибок 401 (неавторизован)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;