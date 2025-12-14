// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
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

  if (loading) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10">Загрузка...</p></div>;
  if (error) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10 text-red-500">{error}</p></div>;
  if (!user) return null;

  // 🔥 Мокаем статусы (в реальном проекте они должны приходить с бэка)
  const badges = [
    { id: 1, title: "Надёжный продавец", bgColor: "#E6F6FF", textColor: "#0071F0" },
    { id: 2, title: "18 покупок с Авито Доставкой", bgColor: "#FFF8E6", textColor: "#FFA800" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-8">
      {/* Шапка профиля в стиле Avito */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Аватар */}
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-700 border-4 border-white shadow-md">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            {/* Информация */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.username}</h1>

              {/* Статусы (как у Avito) */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {badges.map(badge => (
                  <span
                    key={badge.id}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: badge.bgColor, color: badge.textColor }}
                  >
                    {badge.title}
                  </span>
                ))}
              </div>

              {user.location && (
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-1 mb-1">
                  <span>📍</span> {user.location}
                </p>
              )}
              {user.bio && <p className="text-gray-700 mt-2 max-w-2xl">{user.bio}</p>}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center md:justify-start">
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              💬 Написать
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
              📞 Позвонить
            </button>
          </div>
        </div>
      </div>

      {/* Объявления */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Объявления пользователя</h2>

        {pets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">У пользователя пока нет объявлений</p>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Назад
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
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