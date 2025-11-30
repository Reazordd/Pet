// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';

function ProfilePage() {
  const { id: user_id } = useParams();  // ✅ Теперь `id` из URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ✅ Пагинация
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProfile();
  }, [user_id, page]); // ✅ Добавим page в зависимости

  const fetchProfile = async () => {
    try {
      // ✅ Получаем профиль
      const profileRes = await api.get(`/profile/${user_id}/`);
      setUser(profileRes.data);

      // ✅ Получаем питомцев с пагинацией
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

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return null;

  return (
    <div className="profile-page max-w-4xl mx-auto p-4">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-center mb-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover mr-4"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mr-4" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
            {user.location && <p>📍 {user.location}</p>}
            {user.bio && <p className="mt-2">{user.bio}</p>}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Объявления пользователя</h2>
          {pets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <p>У пользователя пока нет объявлений.</p>
          )}

          {/* ✅ Пагинация */}
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
    </div>
  );
}

export default ProfilePage;