// frontend/src/pages/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../styles/FavoritesPage.css'; // ✅ Теперь файл существует

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites/');
      setFavorites(response.data.results || response.data);
    } catch (err) {
      toast.error('Не удалось загрузить избранное');
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
              <Link to={`/pets/${fav.pet.id}`}>
                <img src={fav.pet.image} alt={fav.pet.name} />
                <h3>{fav.pet.name}</h3>
                <p>{fav.pet.city}</p>
                <p>{fav.pet.price ? `${fav.pet.price} ₽` : 'Бесплатно'}</p>
              </Link>
              <button onClick={() => removeFromFavorites(fav.pet.id)}>
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