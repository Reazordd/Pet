// frontend/src/utils/api.js
import axios from "axios";

// 🔥 Добавим `/api` в baseURL, чтобы все вызовы шли через него
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: {
    "Accept": "application/json",
  },
});

// Attach access token if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

export default api;