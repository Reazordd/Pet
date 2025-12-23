// frontend/src/components/PetCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const SPECIES_LABELS = { /* ... */ };
const OFFER_LABELS = { /* ... */ };

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

  // ✅ Используем pet.images[0].image
  const imageUrl = pet.images?.[0]?.image || '/images/placeholder-pet.jpg';

  return (
    <div className="pet-card">
      <Link to={`/pets/${pet.id}`}>
        <img
          src={imageUrl}
          alt={pet.name || 'Питомец'}
          className="pet-card-image" // ← Avito-стиль
          onError={(e) => e.target.src = '/images/placeholder-pet.jpg'}
        />
        <h3>{pet.name || 'Без имени'}</h3>
        <p>{pet.city}</p>
        <p>{formatPrice(pet.price)}</p>
      </Link>
      <button onClick={toggleFavorite}>
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

export default PetCard;