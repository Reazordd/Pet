// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import { buildImageUrl } from '../utils/image';
import '../styles/Avatar.css';

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
  const [activeTab, setActiveTab] = useState('pets');

  useEffect(() => {
    if (!user_id || isNaN(user_id) || user_id <= 0) {
      setError('Некорректный ID пользователя');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user_id, page, activeTab]);

  const fetchProfile = async () => {
    try {
      const profileRes = await api.get(`/profile/${user_id}/`);
      setUser(profileRes.data);

      if (activeTab === 'pets') {
        const petsRes = await api.get(`/pets/?user=${user_id}&page=${page}`);
        setPets(petsRes.data.results || []);
        setTotalPages(Math.ceil((petsRes.data.count || 0) / 12));
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err.response || err);
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

      if (currentUserId === user_id) {
        toast.warn('Нельзя написать самому себе');
        return;
      }

      // 🔥 Добавлена привязка к первому объявлению (если есть)
      const petId = pets.length > 0 ? pets[0].id : null;
      const res = await api.post('/chat/create/', {
        target_user_id: user_id,
        pet_id: petId
      });

      const chatId = res.data.id;
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Ошибка создания чата:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Не удалось начать чат';
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10">Загрузка...</p></div>;
  if (error) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10 text-red-500">{error}</p></div>;
  if (!user) return null;

  // 🔥 Используем данные из API
  const badges = user.badges || [];
  const reviewCount = user.review_count || 0;

  // Функция склонения слова "отзыв"
  const getReviewText = (count) => {
    if (count === 0) return 'отзывов';
    if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'отзыва';
    return 'отзывов';
  };

  return (
    <div className="seller-profile max-w-4xl mx-auto p-4">
      <div className="seller-header">
        <div className="seller-avatar">
          {user.avatar ? (
            <img
              src={buildImageUrl(user.avatar)}
              alt={user.username}
              className="avatar-lg"
            />
          ) : (
            <div className="avatar-placeholder">
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="seller-info">
          <h1>{user.username}</h1>

          {/* 🔥 Блок рейтинга как у Avito — ПРЯМО ПОД ИМЕНЕМ */}
          {reviewCount > 0 && (
            <div className="mt-1">
              <Link
                to={`/reviews/user/${user_id}`}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                {reviewCount} {getReviewText(reviewCount)}
              </Link>
            </div>
          )}

          <div className="mb-3">
            {badges.map((badge, idx) => (
              <span key={idx} className="badge" style={{ backgroundColor: badge.bgColor, color: badge.textColor }}>
                {badge.title}
              </span>
            ))}
          </div>

          {user.location && <p className="seller-location">📍 {user.location}</p>}
          {user.bio && <p className="seller-bio">{user.bio}</p>}

          <div className="seller-contacts">
            <button className="btn btn-primary" onClick={handleSendMessage}>
              💬 Написать
            </button>
            <button className="btn btn-secondary">
              📞 Позвонить
            </button>
          </div>
        </div>
      </div>

      {/* Вкладки — без изменений */}
      <div className="profile-tabs mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Объявления
          </button>
          <Link
            to={`/reviews/user/${user_id}`}
            className="py-2 px-1 border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Отзывы ({reviewCount})
          </Link>
        </nav>
      </div>

      {activeTab === 'pets' && (
        <div className="seller-pets mt-6">
          <h2>Объявления пользователя</h2>
          {pets.length > 0 ? (
            <div className="pets-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} size="small" />
              ))}
            </div>
          ) : (
            <div className="empty-state py-8 text-center">
              <p>У пользователя пока нет объявлений</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                &lt;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    page === i + 1 ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;