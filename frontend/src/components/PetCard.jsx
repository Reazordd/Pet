import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PetCard.css';

function PetCard({ pet }) {
    const formatPrice = (price) => {
        if (!price) return 'Цена не указана';
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    return (
        <Link to={`/pets/${pet.id}`} className="pet-card">
            <div className="pet-image">
                {pet.photo ? (
                    <img src={pet.photo} alt={pet.name} />
                ) : (
                    <div className="no-photo">🐾</div>
                )}
            </div>
            <div className="pet-body">
                <div className="pet-name">{pet.name}</div>
                <div className="pet-price">{formatPrice(pet.price)}</div>
                <div className="pet-meta">
                    <span>{pet.category?.name || 'Без категории'}</span>
                    <span className="views">👁 {pet.views_count || 0}</span>
                </div>
            </div>
        </Link>
    );
}

export default PetCard;
