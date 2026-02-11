import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { buildImageUrl } from '../utils/image';

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
    const willBeFavorite = !isFavorite;
    setIsFavorite(willBeFavorite);
    try {
      if (willBeFavorite) {
        await api.post(`/pets/${pet.id}/favorite/`);
        toast.success('Добавлено в избранное');
      } else {
        await api.delete(`/pets/${pet.id}/favorite/`);
        toast.info('Удалено из избранного');
      }
    } catch (err) {
      setIsFavorite(isFavorite);
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

  const petName = pet.name || pet.breed || 'Питомец';

  return (
    <div
      className={`pet-card ${size === 'small' ? 'pet-card-small' : ''}`}
      style={{
        position: 'relative',
        width: '260px',
        height: '290px',
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        backgroundColor: 'var(--panel)', // ← основа: белая в light, тёмная в dark
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
      }}
    >
      {/* Контейнер с изображением — адаптивный фон */}
      <div
        style={{
          height: '220px',
          borderRadius: '12px 12px 0 0',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--card-img-bg)', // ← ключевая переменная
          padding: '8px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Link to={`/pets/${pet.id}`} style={{ display: 'block', height: '100%' }}>
            <img
              src={imageUrl}
              alt={petName}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'top center',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </Link>
        </div>
      </div>

      {/* Блок с текстом — всегда белый в light, тёмный в dark (через --panel) */}
      <div
        style={{
          padding: '12px 12px 8px',
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: 'var(--panel)', // ← белый в light, #071025 в dark
          borderTop: '1px solid var(--muted)',
        }}
      >
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          margin: '0 0 4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'var(--text)',
        }}>
          {petName}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          margin: '0 0 6px',
        }}>
          {pet.city}
        </p>
        {!pet.is_active && (
          <span style={{
            color: 'var(--danger)',
            fontSize: '0.75rem',
            fontWeight: 500,
            marginBottom: '6px',
          }}>
            Снято с публикации
          </span>
        )}
        <p style={{
          fontWeight: 700,
          color: 'var(--accent)',
          fontSize: '1.1rem',
          margin: 0,
          textDecoration: !pet.is_active ? 'line-through' : 'none',
        }}>
          {formatPrice(pet.price)}
        </p>
      </div>

      {/* Кнопка "Избранное" */}
      <button
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          fontSize: '1.4rem',
          cursor: 'pointer',
          zIndex: 10,
          color: isFavorite ? '#ff3b3b' : 'var(--muted)',
          transition: 'all 0.2s',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.25)';
          e.currentTarget.style.color = isFavorite ? '#ff0000' : 'var(--text)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.color = isFavorite ? '#ff3b3b' : 'var(--muted)';
        }}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

export default PetCard;