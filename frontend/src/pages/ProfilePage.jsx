// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import PetCard from '../components/PetCard';
import '../styles/SellerProfile.css';

function ProfilePage() {
  const { id: user_id_str } = useParams();
  const user_id = Number(user_id_str);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user_id || isNaN(user_id)) {
      setError('Некорректный ID пользователя');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user_id, page]);

  const fetchProfile = async () => {
    try {
      const profileRes = await api.get(`/profile/${user_id}/`);
      setUser(profileRes.data);

      const petsRes = await api.get(`/pets/?user=${user_id}&page=${page}`);
      setPets(petsRes.data.results || []);
      setTotalPages(Math.ceil((petsRes.data.count || 0) / 12));
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      setError('Профиль не найден');
      toast.error('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.info('Войдите, чтобы написать продавцу');
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentUserId = Number(decoded.user_id);

      // ✅ Отправляем обоих пользователей
      const res = await api.post('/create/', {
        users: [user_id, currentUserId]
      });
      const chatId = res.data.id;
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Ошибка создания чата:', err.response?.data || err.message);
      toast.error('Не удалось открыть чат');
    }
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!user) return null;

  return (
    <div className="seller-profile max-w-4xl mx-auto p-4">
      <div className="seller-header flex flex-col md:flex-row items-center gap-6 mb-8">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
            {user.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="seller-info text-center md:text-left">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          {user.location && <p className="seller-location text-gray-600">📍 {user.location}</p>}
          {user.bio && <p className="seller-bio mt-2 text-gray-700">{user.bio}</p>}
          <div className="seller-contacts flex justify-center md:justify-start gap-3 mt-4">
            <button
              className="btn btn-secondary px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSendMessage}
            >
              Написать
            </button>
            <button className="btn btn-primary px-5 py-2 rounded border border-gray-300 text-gray-700">
              Позвонить
            </button>
          </div>
        </div>
      </div>

      <div className="seller-pets">
        <h2 className="text-xl font-bold mb-4">Объявления пользователя</h2>
        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-8 text-gray-500">
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