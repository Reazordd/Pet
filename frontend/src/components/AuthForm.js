// components/AuthForm.js
import React, { useState } from 'react';
import api from '../utils/api';  // Импортируем наш api
import jwt_decode from 'jwt-decode';

function AuthForm({ type = 'login' }) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (type === 'register') {
                // Регистрация
                await api.post('/users/', credentials);

                // Автоматический вход после регистрации
                const loginResponse = await api.post('/token/', {
                    username: credentials.username,
                    password: credentials.password
                });

                localStorage.setItem('access_token', loginResponse.data.access);
                localStorage.setItem('refresh_token', loginResponse.data.refresh);
            } else {
                // Вход
                const response = await api.post('/token/', {
                    username: credentials.username,
                    password: credentials.password
                });

                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
            }

            window.location.href = '/';
        } catch (error) {
            setError(error.response?.data?.detail || 'Произошла ошибка');
            console.error('Ошибка:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='auth-form'>
            <h2>{type === 'login' ? 'Вход' : 'Регистрация'}</h2>

            {error && <div className='error'>{error}</div>}

            {type === 'register' && (
                <div className='form-group'>
                    <label>Email</label>
                    <input
                        type='email'
                        name='email'
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}

            <div className='form-group'>
                <label>Логин</label>
                <input
                    type='text'
                    name='username'
                    value={credentials.username}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className='form-group'>
                <label>Пароль</label>
                <input
                    type='password'
                    name='password'
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type='submit'>
                {type === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
        </form>
    );
}

export default AuthForm;