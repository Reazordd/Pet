import axios from 'axios';
import { toast } from 'react-toastify';
import { logout, getRefreshToken } from './auth';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// ✅ Автоматически подставляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Обработка ошибок и рефреш токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken }, { withCredentials: true });
          const { access } = res.data;
          localStorage.setItem('access_token', access);
          original.headers.Authorization = `Bearer ${access}`;
          return api(original);
        }
      } catch {
        logout();
      }
    }

    if (error.code === 'ECONNABORTED') toast.error('⏱ Таймаут соединения');
    else if (error.message === 'Network Error') toast.error('🌐 Ошибка сети');
    else if (error.response?.data?.detail) toast.error(error.response.data.detail);
    else if (error.response?.data) {
      Object.values(error.response.data).flat().forEach((msg) => toast.error(msg));
    }

    return Promise.reject(error);
  }
);

export default api;
