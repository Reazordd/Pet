export const checkToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return false;
    }
    try {
        const decoded = jwt_decode(token);
        if (decoded.exp < Date.now() / 1000) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
};
