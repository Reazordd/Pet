import axios from 'axios';
import { toast } from 'react-toastify';
import { logout, getRefreshToken } from './auth';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // важно если будем использовать CSRF cookie / session auth
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
                    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    }, { withCredentials: true });
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

        if (error.response?.status >= 500) {
            toast.error('Серверная ошибка. Попробуйте позже.');
        } else if (error.response?.data?.detail) {
            toast.error(error.response.data.detail);
        } else if (error.response?.data) {
            const errors = Object.values(error.response.data).flat();
            errors.forEach((err) => {
                if (typeof err === 'string') toast.error(err);
                else if (Array.isArray(err)) err.forEach(e => toast.error(e));
            });
        } else if (error.code === 'ECONNABORTED') {
            toast.error('Таймаут соединения. Проверьте интернет соединение.');
        } else if (error.message === 'Network Error') {
            toast.error('Ошибка сети. Проверьте интернет соединение.');
        }

        return Promise.reject(error);
    }
);

export default api;
