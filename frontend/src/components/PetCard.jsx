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

const PetCard = ({ pet }) => {
  const [isFavorite, setIsFavorite] = useState(pet.is_favorite);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/pets/${pet.id}/favorite/`);
        setIsFavorite(false);
        toast.info('Удалено из избранного');
      } else {
        await api.post(`/pets/${pet.id}/favorite/`);
        setIsFavorite(true);
        toast.success('Добавлено в избранное');
      }
    } catch (err) {
      toast.error('Ошибка при обновлении избранного');
    }
  };

  const formatPrice = (price) => {
    if (price === null) return 'Бесплатно';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const imageUrl = pet.images?.length > 0
    ? buildImageUrl(pet.images[0].image)
    : '/images/placeholder-pet.jpg';

  return (
    <div className="pet-card">
      <Link to={`/pets/${pet.id}`} className="pet-image-link">
        <div className="pet-image">
          <img
            src={imageUrl}
            alt={pet.name || 'Питомец'}
            onError={(e) => e.target.src = '/images/placeholder-pet.jpg'}
          />
        </div>
        <div className="pet-info">
          <h3 className="pet-name">{pet.name || 'Без имени'}</h3>
          <p className="pet-city">{pet.city}</p>
          <p className="pet-price">{formatPrice(pet.price)}</p>
        </div>
      </Link>
      <button
        onClick={toggleFavorite}
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

export default PetCard;