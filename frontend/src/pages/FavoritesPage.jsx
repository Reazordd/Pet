import React, { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import PetCard from "../components/PetCard";
import "../styles/Favorites.css";

function FavoritesPage() {
  const { favorites } = useContext(FavoritesContext);

  return (
    <div className="favorites-page">
      <h1>Избранное ❤️</h1>
      {favorites.length === 0 ? (
        <p className="no-favorites">Вы ещё ничего не добавили в избранное.</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
