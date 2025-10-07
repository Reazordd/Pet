import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { checkToken } from '../utils/auth';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (checkToken()) {
        navigate('/');
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirm) {
            toast.error('Пароли не совпадают');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Пароль должен содержать минимум 6 символов');
            return;
        }

        setLoading(true);

        try {
            const { password_confirm, ...submitData } = formData;
            const response = await api.post('/register/', submitData);

            // После регистрации получаем токены через отдельный login
            const loginResponse = await api.post('/token/', {
                username: submitData.username,
                password: submitData.password
            });

            localStorage.setItem('access_token', loginResponse.data.access);
            localStorage.setItem('refresh_token', loginResponse.data.refresh);

            toast.success('Регистрация прошла успешно!');
            navigate('/');
        } catch (error) {
            if (error.response?.data) {
                Object.values(error.response.data).forEach(errors => {
                    if (Array.isArray(errors)) {
                        errors.forEach(err => toast.error(err));
                    }
                });
            } else {
                toast.error('Ошибка регистрации. Проверьте соединение.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Регистрация</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">Имя</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Ваше имя"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Фамилия</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Ваша фамилия"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Логин *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Придумайте логин"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Телефон</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="+7 (999) 999-99-99"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Пароль *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Минимум 6 символов"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_confirm">Подтверждение пароля *</label>
                            <input
                                type="password"
                                id="password_confirm"
                                name="password_confirm"
                                value={formData.password_confirm}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Повторите пароль"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="auth-links">
                    <p>
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="auth-link">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
