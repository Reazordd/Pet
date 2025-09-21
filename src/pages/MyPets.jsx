import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function MyPets() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchMyPets();
        fetchStats();
    }, []);

    const fetchMyPets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pets/my_pets/');
            setPets(response.data.results || response.data);
        } catch (error) {
            toast.error('Ошибка при загрузке объявлений');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/profile/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const togglePetActive = async (petId, currentStatus) => {
        try {
            const response = await api.post(`/pets/${petId}/toggle_active/`);
            setPets(prev => prev.map(pet =>
                pet.id === petId ? { ...pet, is_active: response.data.is_active } : pet
            ));
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Ошибка при изменении статуса');
        }
    };

    const deletePet = async (petId) => {
        if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
            return;
        }

        try {
            await api.delete(`/pets/${petId}/`);
            setPets(prev => prev.filter(pet => pet.id !== petId));
            toast.success('Объявление удалено');
        } catch (error) {
            toast.error('Ошибка при удалении объявления');
        }
    };

    return (
        <div className="my-pets">
            <div className="page-header">
                <h1>Мои объявления</h1>
                <Link to="/create" className="btn btn-primary">
                    📝 Создать новое объявление
                </Link>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.total_pets || 0}</div>
                            <div className="stat-label">Всего объявлений</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👁️</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.total_views || 0}</div>
                            <div className="stat-label">Всего просмотров</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.active_pets || 0}</div>
                            <div className="stat-label">Активных объявлений</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {stats.avg_price ? Math.round(stats.avg_price) : 0} ₽
                            </div>
                            <div className="stat-label">Средняя цена</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="pets-section">
                <h2>Мои животные</h2>

                {loading ? (
                    <div className="pets-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="pet-card">
                                <Skeleton height={200} />
                                <Skeleton count={3} />
                            </div>
                        ))}
                    </div>
                ) : pets.length > 0 ? (
                    <div className="pets-grid">
                        {pets.map(pet => (
                            <div key={pet.id} className="pet-card-with-actions">
                                <PetCard pet={pet} />

                                <div className="pet-actions">
                                    <Link
                                        to={`/pets/${pet.id}`}
                                        className="btn btn-secondary btn-small"
                                    >
                                        👁️ Посмотреть
                                    </Link>

                                    <button
                                        onClick={() => togglePetActive(pet.id, pet.is_active)}
                                        className={`btn btn-small ${
                                            pet.is_active ? 'btn-warning' : 'btn-success'
                                        }`}
                                    >
                                        {pet.is_active ? '❌ Деактивировать' : '✅ Активировать'}
                                    </button>

                                    <button
                                        onClick={() => deletePet(pet.id)}
                                        className="btn btn-danger btn-small"
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🐾</div>
                        <h3>У вас пока нет объявлений</h3>
                        <p>Создайте первое объявление, чтобы начать продавать</p>
                        <Link to="/create" className="btn btn-primary">
                            Создать объявление
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPets;