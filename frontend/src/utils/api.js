// frontend/src/utils/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Accept": "application/json",
  },
});

// 🔥 ИСПРАВЛЕНО: убрали /profile/ — все профильные запросы требуют токен
const PUBLIC_ENDPOINTS = [
  '/register/',
  '/login/',
  '/categories/',
  '/breeds/',
];

api.interceptors.request.use((config) => {
  const isPublic = PUBLIC_ENDPOINTS.some(endpoint =>
    config.url.startsWith(endpoint)
  );

  if (!isPublic) {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;