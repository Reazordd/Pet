// frontend/src/utils/api.js
import axios from "axios";

// 🔥 baseURL ДОЛЖЕН включать /api
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
  } catch (e) {
    console.warn("Token parse error", e);
  }
  return config;
});

export default api;