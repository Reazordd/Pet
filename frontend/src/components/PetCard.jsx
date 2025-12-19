// frontend/src/components/PetCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const SPECIES_LABELS = {
  dog: 'Собака',
  cat: 'Кошка',
  bird: 'Птица',
  rodent: 'Грызун',
  fish: 'Рыба',
  reptile: 'Рептилия',
  other: 'Другое',
};

const OFFER_LABELS = {
  sale: 'Продажа',
  giveaway: 'Отдам',
  search: 'Ищу',
};

const PetCard = ({ pet }) => {
  const [isFavorite, setIsFavorite] = useState(pet.is_favorite);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        // ✅ ИСПРАВЛЕНО: DELETE на /favorite/, а не /remove_favorite/
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

  return (
    <div className="pet-card">
      <Link to={`/pets/${pet.id}`}>
        <img
          src={pet.image || '/images/placeholder-pet.jpg'}
          alt={pet.name || 'Питомец'}
          onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
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