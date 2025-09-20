import React, { useState } from 'react';
import axios from 'axios';

function AuthForm({ type = 'login' }) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    };

    // Добавим обработку регистрации
    handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (type === 'register') {
                // При регистрации отправляем POST запрос на /api/users/
                const response = await axios.post(
                    '/api/users/',
                    credentials
                );
                // Сохраняем токен после успешной регистрации
                localStorage.setItem('access_token', response.data.token);
            } else {
                // При входе в систему
                const response = await axios.post(
                    '/api/token/',
                    credentials
                );
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
            }
            window.location.href = '/';
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };


    return (
        <form onSubmit={handleSubmit} className='auth-form'>
            <h2>{type === 'login' ? 'Вход' : 'Регистрация'}</h2>
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
