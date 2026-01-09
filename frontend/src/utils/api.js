// frontend/src/utils/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Accept": "application/json",
  },
});

// 🔥 УМНАЯ ПРОВЕРКА: только точно публичные эндпоинты
const isPublicEndpoint = (url) => {
  if (!url) return false;

  // Полностью публичные
  if (
    url.startsWith('/token/') ||
    url.startsWith('/auth/register/') ||
    url.startsWith('/auth/activate/') ||
    url.startsWith('/auth/password/reset/') ||
    url.startsWith('/categories/') ||
    url.startsWith('/breeds/')
  ) {
    return true;
  }

  // /pets/ — список (публичный)
  if (url === '/pets/' || url === '/pets') {
    return true;
  }

  // /pets/123/ — детали объявления (публичные)
  if (/^\/pets\/\d+\/?$/.test(url)) {
    return true;
  }

  // ВСЁ ОСТАЛЬНОЕ — требует авторизации
  return false;
};

api.interceptors.request.use((config) => {
  if (!isPublicEndpoint(config.url)) {
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