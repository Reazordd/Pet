import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { checkToken, logout } from '../utils/auth';

function Profile() {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        avatar: null
    });
    const [currentAvatar, setCurrentAvatar] = useState('');
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (!checkToken()) {
            logout();
            return;
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile/');
            setUserData(response.data);
            setCurrentAvatar(response.data.avatar);
        } catch (error) {
            toast.error('Ошибка при загрузке профиля');
            if (error.response?.status === 401) logout();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserData(prev => ({
                ...prev,
                avatar: file
            }));

            // Создание превью
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            Object.keys(userData).forEach(key => {
                if (userData[key] !== null && userData[key] !== '') {
                    submitData.append(key, userData[key]);
                }
            });

            const response = await api.put('/profile/', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setUserData(response.data);
            setCurrentAvatar(response.data.avatar);
            setImagePreview(null);

            toast.success('Профиль успешно обновлен!');
        } catch (error) {
            if (error.response?.data) {
                Object.values(error.response.data).forEach(errors => {
                    if (Array.isArray(errors)) {
                        errors.forEach(err => toast.error(err));
                    }
                });
            } else {
                toast.error('Ошибка при обновлении профиля');
            }

            if (error.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile">
            <div className="page-header">
                <h1>Мой профиль</h1>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="avatar-container">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Avatar preview" className="avatar" />
                            ) : currentAvatar ? (
                                <img src={currentAvatar} alt="Avatar" className="avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {userData.first_name?.[0] || userData.username?.[0] || 'U'}
                                </div>
                            )}
                        </div>

                        <div className="avatar-actions">
                            <label htmlFor="avatar-upload" className="btn btn-secondary">
                                📷 Сменить фото
                            </label>
                            <input
                                type="file"
                                id="avatar-upload"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            {currentAvatar && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUserData(prev => ({ ...prev, avatar: '' }));
                                        setCurrentAvatar('');
                                    }}
                                    className="btn btn-danger"
                                >
                                    🗑️ Удалить фото
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-section">
                            <h3>Основная информация</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="first_name">Имя</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        name="first_name"
                                        value={userData.first_name || ''}
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
                                        value={userData.last_name || ''}
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
                                    value={userData.username || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Ваш логин"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={userData.email || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Контактная информация</h3>

                            <div className="form-group">
                                <label htmlFor="phone">Телефон</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={userData.phone || ''}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="+7 (999) 999-99-99"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Адрес</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={userData.address || ''}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Ваш адрес"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-large"
                                disabled={loading}
                            >
                                {loading ? 'Сохранение...' : '💾 Сохранить изменения'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={fetchProfile}
                                disabled={loading}
                            >
                                ⟳ Отменить изменения
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
