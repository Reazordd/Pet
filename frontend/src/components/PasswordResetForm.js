import React, { useState } from 'react';
import axios from 'axios';

function PasswordResetForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/password_reset/', { email });
            setMessage('Инструкция по сбросу пароля отправлена на email');
        } catch (error) {
            setMessage('Ошибка при отправке запроса');
        }
    };

    return (
        <form onSubmit={handleSubmit} className='password-reset-form'>
            <h2>Восстановление пароля</h2>
            <div className='form-group'>
                <label>Email</label>
                <input
                    type='email'
                    value={email}
                    onChange={handleChange}
                    required
                />
            </div>
            {message && <div className='message'>{message}</div>}
            <button type='submit'>Отправить</button>
        </form>
    );
}

export default PasswordResetForm;
