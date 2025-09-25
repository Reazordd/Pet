import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

function PasswordReset() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/password_reset/', { email });
            setSubmitted(true);
            toast.success('Инструкции по сбросу пароля отправлены на email');
        } catch (error) {
            toast.error('Ошибка при отправке запроса');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Проверьте вашу почту</h2>
                    <div className="success-message">
                        <p>Инструкции по сбросу пароля были отправлены на {email}</p>
                        <p>Проверьте папку "Спам", если письмо не пришло в течение 5 минут</p>
                    </div>
                    <div className="auth-links">
                        <Link to="/login" className="auth-link">
                            Вернуться к входу
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Восстановление пароля</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Введите ваш email"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Отправка...' : 'Отправить инструкции'}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/login" className="auth-link">
                        Вернуться к входу
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PasswordReset;