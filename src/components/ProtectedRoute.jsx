import React from 'react';
import { Navigate } from 'react-router-dom';
import { checkToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = checkToken();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;