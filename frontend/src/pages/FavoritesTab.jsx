// frontend/src/pages/FavoritesTab.jsx
import React, { useState, useEffect } from "react";
import api from "../utils/api";
import PetCard from "../components/PetCard";

function FavoritesTab() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/pets/?favorite=true");
      setFavorites(res.data.results || []);
    } catch (err) {
      console.error("Ошибка загрузки избранного:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Загрузка избранного...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Избранные объявления</h2>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Нет избранных объявлений.</p>
      )}
    </div>
  );
}

export default FavoritesTab;