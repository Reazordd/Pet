// frontend/src/components/PetCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { buildImageUrl } from '../utils/image';
import '../styles/PetCard.css';

const SPECIES_LABELS = {
  dog: 'Собака', cat: 'Кошка', bird: 'Птица',
  rodent: 'Грызун', fish: 'Рыба', reptile: 'Рептилия', other: 'Другое',
};

const OFFER_LABELS = {
  sale: 'Продажа', giveaway: 'Отдам', search: 'Ищу',
};

const PetCard = ({ pet, size = 'default' }) => {
  const [isFavorite, setIsFavorite] = useState(pet.is_favorite);

  const toggleFavorite = async () => {
    // 🔥 ИСПРАВЛЕНО: is_favorite → isFavorite
    const willBeFavorite = !isFavorite;
    setIsFavorite(willBeFavorite); // оптимистичное обновление

    try {
      if (willBeFavorite) {
        await api.post(`/pets/${pet.id}/favorite/`);
        toast.success('Добавлено в избранное');
      } else {
        await api.delete(`/pets/${pet.id}/favorite/`);
        toast.info('Удалено из избранного');
      }
    } catch (err) {
      // Возврат при ошибке
      setIsFavorite(isFavorite);
      console.error('Ошибка избранного:', err.response || err);

      if (err.response?.status === 400) {
        toast.error('Уже в избранном');
      } else if (err.response?.status === 404) {
        toast.error('Объявление не найдено');
      } else {
        toast.error('Не удалось обновить избранное');
      }
    }
  };

  const formatPrice = (price) => {
    if (price === null) return 'Бесплатно';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const imageUrl = pet.images && pet.images.length > 0 && pet.images[0]?.image
    ? buildImageUrl(pet.images[0].image)
    : '/images/placeholder-pet.jpg';

  return (
    <div className={`pet-card ${size === 'small' ? 'pet-card-small' : ''}`}>
      <div className="pet-image-container">
        <Link to={`/pets/${pet.id}`} className="pet-card-link">
          <div className="pet-image">
            <img
              src={imageUrl}
              alt={pet.name || 'Питомец'}
              onError={(e) => e.target.src = '/images/placeholder-pet.jpg'}
            />
          </div>
        </Link>
      </div>
      <div className="pet-info">
        <h3 className="pet-name">{pet.name || 'Без имени'}</h3>
        <p className="pet-city">{pet.city}</p>
        <p className="pet-price">{formatPrice(pet.price)}</p>
      </div>
      <button
        onClick={toggleFavorite}
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

export default PetCard;