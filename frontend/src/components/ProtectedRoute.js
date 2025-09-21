import React from 'react';
import { Navigate } from 'react-router-dom';
import { checkToken } from '../utils/auth';

const ProtectedRoute = ({ children, requireAuth = true }) => {
    const isAuthenticated = checkToken();

    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
