// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import '../styles/SellerProfile.css';

function ProfilePage() {
  const { id: user_id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user_id) {
      setError('ID пользователя не указан');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user_id, page]);

  const fetchProfile = async () => {
    try {
      // ✅ Исправлено: теперь вызывает /api/profile/:id/
      const profileRes = await api.get(`/profile/${user_id}/`);
      setUser(profileRes.data);

      const petsRes = await api.get(`/pets/?user=${user_id}&page=${page}`);
      setPets(petsRes.data.results || []);
      setTotalPages(Math.ceil((petsRes.data.count || 0) / 12));
    } catch (err) {
      console.error(err);
      setError('Профиль не найден');
      toast.error('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!user) return null;

  return (
    <div className="seller-profile">
      <div className="seller-header">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="avatar-placeholder">👤</div>
        )}
        <div className="seller-info">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="seller-email text-gray-600">{user.email}</p>
          {user.location && <p className="seller-location">📍 {user.location}</p>}
          {user.bio && <p className="seller-bio">{user.bio}</p>}
          <div className="seller-contacts">
            <button className="btn btn-secondary">Написать</button>
            <button className="btn btn-primary">Позвонить</button>
          </div>
        </div>
      </div>

      <div className="seller-pets">
        <h2>Объявления пользователя</h2>
        {pets.length > 0 ? (
          <div className="pets-grid">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>У пользователя пока нет объявлений.</p>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Назад
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'border'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;