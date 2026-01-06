// frontend/src/pages/ActivateAccount.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function ActivateAccount() {
    const { uidb64, token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const activate = async () => {
            try {
                await api.get(`/auth/activate/${uidb64}/${token}/`);
                toast.success('Аккаунт подтверждён! Теперь вы можете войти.');
                navigate('/login');
            } catch (error) {
                console.error('Activation error:', error);
                toast.error('Неверная или устаревшая ссылка для активации.');
                navigate('/register');
            }
        };
        activate();
    }, [uidb64, token, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Подтверждение аккаунта</h2>
                <p>Пожалуйста, подождите...</p>
            </div>
        </div>
    );
}