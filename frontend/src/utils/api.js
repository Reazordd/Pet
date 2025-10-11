import axios from 'axios';
import { toast } from 'react-toastify';
import { logout, getRefreshToken } from './auth';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 👈 важно! передаёт cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получаем CSRF токен из cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // добавляем CSRF
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) config.headers['X-CSRFToken'] = csrftoken;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      // если CSRF отсутствует, попробуем обновить cookie
      await axios.get(`${API_BASE_URL}/csrf/`, { withCredentials: true });
      return api(originalRequest);
    }

    if (error.response?.status >= 500) {
      toast.error('Серверная ошибка. Попробуйте позже.');
    } else if (error.response?.data?.detail) {
      toast.error(error.response.data.detail);
    } else if (error.response?.data) {
      const errors = Object.values(error.response.data).flat();
      errors.forEach((err) => {
        if (typeof err === 'string') toast.error(err);
        else if (Array.isArray(err)) err.forEach((e) => toast.error(e));
      });
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Таймаут соединения. Проверьте интернет.');
    } else if (error.message === 'Network Error') {
      toast.error('Ошибка сети. Проверьте интернет.');
    }

    return Promise.reject(error);
  }
);

export default api;
