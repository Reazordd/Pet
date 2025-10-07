import React from 'react';
import { Link } from 'react-router-dom';

function PetCard({ pet }) {
    const formatPrice = (price) => {
        if (!price) return 'Цена не указана';
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
        <div className="pet-card">
            <Link to={`/pets/${pet.id}`} className="pet-card-link">
                <div className="pet-image">
                    {pet.photo ? (
                        <img
                            src={pet.photo}
                            alt={pet.name}
                            onError={(e) => {
                                e.target.src = '/images/default-pet.jpg';
                            }}
                        />
                    ) : (
                        <div className="no-image">🐾</div>
                    )}
                </div>

                <div className="pet-info">
                    <h3 className="pet-name">{pet.name}</h3>
                    <p className="pet-breed">{getBreedLabel(pet.breed)}</p>
                    <p className="pet-age">{pet.age} лет</p>
                    <p className="pet-price">{formatPrice(pet.price)}</p>

                    <div className="pet-meta">
                        <span className="pet-category">{pet.category_name}</span>
                        <span className="pet-views">👁️ {pet.views_count || 0}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default PetCard;