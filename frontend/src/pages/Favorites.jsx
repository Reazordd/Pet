import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PetCard from "../components/PetCard";
import "../styles/Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(saved);
  }, []);

  const removeFromFavorites = (id) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>❤️ Избранное</h1>
        {favorites.length > 0 && (
          <button
            className="clear-btn"
            onClick={() => {
              localStorage.removeItem("favorites");
              setFavorites([]);
            }}
          >
            Очистить всё
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <p>У вас пока нет избранных объявлений 😿</p>
          <Link to="/pets" className="btn btn-primary">
            Смотреть объявления
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((pet) => (
            <div key={pet.id} className="favorite-item">
              <PetCard pet={pet} />
              <button
                className="remove-btn"
                onClick={() => removeFromFavorites(pet.id)}
              >
                ❌ Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
