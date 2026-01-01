// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import { buildImageUrl } from '../utils/image';
import '../styles/Avatar.css';

// 🔥 Склонение месяцев в родительном падеже
const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

function getRussianMonthYear(dateString) {
  const date = new Date(dateString);
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  return `${MONTHS_GENITIVE[monthIndex]} ${year}`;
}

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

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg_rating: 0, total_reviews: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    let currentUserIdFromToken = null;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        currentUserIdFromToken = Number(decoded.user_id);
        setCurrentUserId(currentUserIdFromToken);
      } catch (e) {
        console.warn("Invalid token");
      }
    }

    if (!user_id || isNaN(user_id) || user_id <= 0) {
      setError('Некорректный ID пользователя');
      setLoading(false);
      return;
    }
    fetchProfile();
    fetchReviews(user_id);
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

  const fetchReviews = async (userId) => {
    try {
      const res = await api.get(`/reviews/user/${userId}/reviews/`);
      setReviews(res.data.reviews);
      setReviewStats(res.data.rating_stats);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
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

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/user/${user_id}/review/`, reviewForm);
      toast.success('Отзыв оставлен!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews(user_id);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ошибка при создании отзыва';
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10">Загрузка...</p></div>;
  if (error) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10 text-red-500">{error}</p></div>;
  if (!user) return null;

  const badges = user.badges || [];
  const reviewCount = reviewStats.total_reviews || 0;

  const getReviewText = (count) => {
    if (count === 0) return 'отзывов';
    if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'отзыва';
    return 'отзывов';
  };

  const canLeaveReview = currentUserId && currentUserId !== user_id;

  // 🔥 Получаем отображаемое имя
  const getDisplayName = (user) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    if (user.username.includes('@')) {
      return user.username.split('@')[0];
    }
    return user.username || 'Пользователь';
  };

  return (
    <div className="seller-profile max-w-4xl mx-auto p-4">
      <div className="seller-header">
        <div className="seller-avatar">
          {user.avatar ? (
            <img
              src={buildImageUrl(user.avatar)}
              alt={getDisplayName(user)}
              className="avatar-lg"
            />
          ) : (
            <div className="avatar-placeholder">
              {getDisplayName(user)?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="seller-info">
          {/* 🔥 ИСПРАВЛЕНО: имя вместо email */}
          <h1>{getDisplayName(user)}</h1>

          <div className="mt-1 flex items-center">
            {reviewCount > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {reviewStats.avg_rating.toFixed(1)}
                </span>
                <span className="text-yellow-400 ml-1">★★★★★</span>
                <span className="text-blue-600 font-medium ml-2">
                  {reviewCount} {getReviewText(reviewCount)}
                </span>
              </>
            ) : (
              <span className="text-gray-500">Пока нет отзывов</span>
            )}
            {canLeaveReview && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-blue-600 text-sm hover:underline ml-2"
              >
                {reviewCount > 0 ? 'Оставить отзыв' : 'Оставить первый отзыв'}
              </button>
            )}
          </div>

          <div className="mb-3">
            {badges.map((badge, idx) => (
              <span key={idx} className="badge" style={{ backgroundColor: badge.bgColor, color: badge.textColor }}>
                {badge.title}
              </span>
            ))}
          </div>

          {user.location && <p className="seller-location">📍 {user.location}</p>}

          {/* 🔥 ПРАВИЛЬНЫЙ ПАДЕЖ */}
          <p className="text-gray-600">
            На PetMarket с {getRussianMonthYear(user.date_joined)}
          </p>

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

      {/* Форма отзыва */}
      {showReviewForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">
            {reviewCount > 0 ? 'Оставить отзыв' : 'Оставить первый отзыв'}
          </h3>
          <form onSubmit={handleCreateReview}>
            <div className="mb-2">
              <label className="block text-sm mb-1">Ваша оценка</label>
              <div className="flex">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                    className="text-2xl"
                  >
                    {reviewForm.rating >= star ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Ваш комментарий..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              rows="3"
            />
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
                Отправить
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список отзывов */}
      {reviews.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-3">Отзывы о {getDisplayName(user)}</h3>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-3 border rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.reviewer.username}</span>
                  <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                </div>
                {review.comment && <p className="text-gray-700 mt-1">{review.comment}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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