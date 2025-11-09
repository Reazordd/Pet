// frontend/src/components/PetCard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/PetCard.css";

function PetCard({ pet }) {
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );
  const isFavorite = favorites.some((f) => f.id === pet.id);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    let updated;
    if (isFavorite) {
      updated = favorites.filter((f) => f.id !== pet.id);
    } else {
      updated = [...favorites, pet];
    }
    setFavorites(updated);
  };

  const price = pet.price
    ? new Intl.NumberFormat("ru-RU").format(pet.price) + " ₽"
    : "Цена не указана";

  return (
    <Link to={`/pets/${pet.id}`} className="pet-card">
      <div className="pet-image">
        {pet.photo ? (
          <img src={pet.photo} alt={pet.name} />
        ) : (
          <div className="no-photo">🐾</div>
        )}

        <button
          className={`favorite-btn ${isFavorite ? "active" : ""}`}
          onClick={toggleFavorite}
          title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="pet-info">
        <div className="pet-price">{price}</div>
        <div className="pet-name">{pet.name}</div>
        <div className="pet-meta">
          <span>{pet.category?.name || "Без категории"}</span>
          <span>👁 {pet.views_count || 0}</span>
        </div>
      </div>
    </Link>
  );
}

export default PetCard;
