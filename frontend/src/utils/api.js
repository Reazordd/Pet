// frontend/src/utils/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Accept": "application/json",
  },
});

// Эндпоинты, где 401 = настоящий логаут (профиль, чаты, управление)
const CRITICAL_AUTH_ENDPOINTS = [
  '/auth/',
  '/me/',
  '/profile/',
  '/chats/',
  '/favorites/',
  '/pets/', // потому что create/update/delete требуют авторизации
];

const isCriticalAuthEndpoint = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0];
  return CRITICAL_AUTH_ENDPOINTS.some(prefix => cleanUrl.startsWith(prefix));
};

// Interceptor: автоматически добавляем токен, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: умный логаут только на критичных эндпоинтах
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      if (isCriticalAuthEndpoint(originalRequest?.url)) {
        // Только здесь — полный логаут
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
      // Иначе — просто пробрасываем ошибку (например, /stats/)
    }
    return Promise.reject(error);
  }
);

export default api;