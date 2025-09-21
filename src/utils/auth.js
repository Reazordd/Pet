// src/utils/auth.js
export const checkToken = () => {
    return localStorage.getItem('token');
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/login';
};

export const isAuthenticated = () => {
    const token = checkToken();
    return !!token;
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};