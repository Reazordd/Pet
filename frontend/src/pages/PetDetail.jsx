import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { checkToken } from '../utils/auth';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function PetDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAuthenticated = checkToken();

    useEffect(() => {
        fetchPet();
    }, [id]);

    const fetchPet = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/pets/${id}/`);
            setPet(response.data);
        } catch (err) {
            setError('Объявление не найдено');
            toast.error('Не удалось загрузить объявление');
        } finally {
            setLoading(false);
        }
    };

    const handleContact = () => {
        if (!isAuthenticated) {
            toast.info('Войдите в систему для связи с продавцом');
            navigate('/login');
            return;
        }

        if (pet.user_phone) {
            window.open(`tel:${pet.user_phone}`, '_blank');
        } else if (pet.user_email) {
            window.open(`mailto:${pet.user_email}`, '_blank');
        } else {
            toast.info('Контактная информация не указана');
        }
    };

    if (error) {
        return (
            <div className="pet-detail">
                <div className="error-state">
                    <h2>{error}</h2>
                    <Link to="/" className="btn btn-primary">
                        Вернуться на главную
                    </Link>
                </div>
            </div>
        );
    }

    if (loading || !pet) {
        return (
            <div className="pet-detail">
                <div className="pet-detail-content">
                    <div className="pet-images">
                        <Skeleton height={400} />
                    </div>
                    <div className="pet-info">
                        <Skeleton height={40} width={200} />
                        <Skeleton height={24} width={100} />
                        <Skeleton height={24} width={80} />
                        <Skeleton height={32} width={150} />
                        <Skeleton count={4} />
                    </div>
                </div>
            </div>
        );
    }

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === '') return 'Цена не указана';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(price);
    };

    const getBreedLabel = (breed) => {
        const breedLabels = {
            dog: 'Собака',
            cat: 'Кошка',
            bird: 'Птица',
            fish: 'Рыба',
            rodent: 'Грызун',
            reptile: 'Рептилия',
            other: 'Другое животное'
        };
        return breedLabels[pet.breed] || pet.breed;
    };

    return (
        <div className="pet-detail">
            <div className="pet-detail-content">
                <div className="pet-images">
                    {pet.photo ? (
                        <img
                            src={pet.photo}
                            alt={pet.name}
                            className="pet-main-image"
                            onError={(e) => {
                                e.target.src = '/images/default-pet.jpg';
                            }}
                        />
                    ) : (
                        <div className="no-image-large">
                            <span>🐾</span>
                            <p>Фото не добавлено</p>
                        </div>
                    )}
                </div>

                <div className="pet-info">
                    <div className="pet-header">
                        <h1>{pet.name}</h1>
                        <div className="pet-meta">
                            <span className="pet-breed">{getBreedLabel(pet.breed)}</span>
                            <span className="pet-age">{pet.age} лет</span>
                            {pet.category?.name && (
                                <span className="pet-category">{pet.category.name}</span>
                            )}
                        </div>
                    </div>

                    <div className="pet-price-section">
                        <h2 className="price">{formatPrice(pet.price)}</h2>
                        <p className="price-note">{!pet.price && 'Цена договорная'}</p>
                    </div>

                    <div className="pet-description">
                        <h3>Описание</h3>
                        <p>{pet.description || 'Описание не добавлено'}</p>
                    </div>

                    <div className="pet-actions">
                        <button
                            onClick={handleContact}
                            className="btn btn-primary btn-large"
                        >
                            📞 Связаться с продавцом
                        </button>

                        {pet.user_phone && (
                            <a
                                href={`tel:${pet.user_phone}`}
                                className="btn btn-secondary"
                            >
                                📞 {pet.user_phone}
                            </a>
                        )}

                        {pet.user_email && (
                            <a
                                href={`mailto:${pet.user_email}`}
                                className="btn btn-secondary"
                            >
                                ✉️ Написать на email
                            </a>
                        )}
                    </div>

                    <div className="pet-stats">
                        <div className="stat">
                            <span className="stat-label">Просмотры:</span>
                            <span className="stat-value">{pet.views_count || 0}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Опубликовано:</span>
                            <span className="stat-value">
                {new Date(pet.created_at).toLocaleDateString('ru-RU')}
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PetDetail;
