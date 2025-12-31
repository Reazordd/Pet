// frontend/src/pages/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import '../styles/FavoritesPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites/');
      // Поддержка обоих форматов: { results: [...] } и [...]
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setFavorites(data);
    } catch (err) {
      toast.error('Не удалось загрузить избранное');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (petId) => {
    try {
      await api.delete(`/pets/${petId}/favorite/`);
      setFavorites(favorites.filter(fav => fav.pet.id !== petId));
      toast.success('Удалено из избранного');
    } catch (err) {
      toast.error('Ошибка при удалении из избранного');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="favorites-page">
      <h1>Избранные объявления</h1>
      {favorites.length === 0 ? (
        <p>У вас пока нет избранных объявлений.</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map(fav => (
            <div key={fav.id} className="favorite-item">
              <PetCard pet={fav.pet} />
              <button
                className="remove-favorite-btn"
                onClick={() => removeFromFavorites(fav.pet.id)}
              >
                Удалить из избранного
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;