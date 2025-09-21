import jwt_decode from 'jwt-decode';

export const checkToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return false;
        }
        return true;
    } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
    }
};

export const getCurrentUser = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        return jwt_decode(token);
    } catch (error) {
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};
