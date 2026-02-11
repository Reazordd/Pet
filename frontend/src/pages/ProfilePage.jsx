import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import { buildImageUrl } from '../utils/image';
import '../styles/ProfilePage.css';

// Склонение месяцев
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
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
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
    fetchReviewStats();
    if (activeTab === 'pets') {
      fetchPets();
    }
  }, [user_id, activeTab, page]);

  const fetchProfile = async () => {
    try {
      const profileRes = await api.get(`/auth/profile/${user_id}/`);
      setUser(profileRes.data);
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err.response || err);
      setError('Профиль не найден');
      toast.error('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async () => {
    try {
      const petsRes = await api.get(`/pets/?user=${user_id}&page=${page}&page_size=12`);
      setPets(petsRes.data.results || []);
      setTotalPages(Math.ceil((petsRes.data.count || 0) / 12));
    } catch (err) {
      console.error('Ошибка загрузки объявлений:', err);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const res = await api.get(`/reviews/user/${user_id}/reviews/`);
      setReviewStats(res.data.rating_stats || { avg_rating: 0, total_reviews: 0 });
    } catch (err) {
      console.error('Ошибка загрузки статистики отзывов:', err);
    }
  };

  const loadReviews = async () => {
    if (!reviewsLoaded) {
      try {
        const res = await api.get(`/reviews/user/${user_id}/reviews/`);
        setReviews(res.data.reviews || []);
        setReviewsLoaded(true);
      } catch (err) {
        console.error('Ошибка загрузки списка отзывов:', err);
      }
    }
  };

  const toggleReviews = () => {
    if (!showReviews && !reviewsLoaded) {
      loadReviews();
    }
    setShowReviews(!showReviews);
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
      fetchReviewStats();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ошибка при создании отзыва';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="content text-center mt-10">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content text-center mt-10">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 btn btn-primary"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const badges = user.badges || [];
  const reviewCount = reviewStats.total_reviews || 0;
  const canLeaveReview = currentUserId && currentUserId !== user_id;

  const getReviewText = (count) => {
    if (count === 0) return 'отзывов';
    if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'отзыва';
    return 'отзывов';
  };

  const getDisplayName = (user) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    if (user.username.includes('@')) {
      return user.username.split('@')[0];
    }
    return user.username || 'Пользователь';
  };

  // ✅ ИСПРАВЛЕНО: каждая звезда обёрнута в span с классом
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return (
      <>
        {Array(fullStars).fill(0).map((_, i) => (
          <span key={`full-${i}`} className="star-filled">★</span>
        ))}
        {hasHalf && <span className="star-filled">★</span>}
        {Array(emptyStars).fill(0).map((_, i) => (
          <span key={`empty-${i}`} className="star-empty">☆</span>
        ))}
      </>
    );
  };

  return (
    <div className="content">
      {/* Header — градиентная шапка */}
      <div className="profile-header">
        <div className="avatar-lg-container">
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
        <div className="header-info">
          <h1>{getDisplayName(user)}</h1>
          {user.location && (
            <p>
              <i className="fas fa-map-marker-alt mr-2"></i>
              {user.location}
            </p>
          )}
          <p>
            <i className="fas fa-calendar-alt mr-2"></i>
            На PetMarket с {getRussianMonthYear(user.date_joined)}
          </p>
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
      </div>

      {/* Рейтинг */}
      <div className="rating-stars">
        <span className="rating-value">{reviewStats.avg_rating.toFixed(1)}</span>
        <div className="stars">{renderStars(reviewStats.avg_rating)}</div>
        <button
          onClick={toggleReviews}
          className="review-count"
        >
          {reviewCount} {getReviewText(reviewCount)} {showReviews ? '▲' : '▼'}
        </button>
      </div>

      {/* ✅ БЕЙДЖ "НАДЁЖНЫЙ ПРОДАВЕЦ" — только если true */}
      {user.is_reliable_seller && (
        <div className="reliable-seller-badge-wrapper">
          <div className="reliable-seller-badge">
            Надёжный продавец
          </div>
        </div>
      )}

      {/* Кнопки и бейджи */}
      <div className="profile-actions">
        <div className="btn-group">
          {user.is_owner && (
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="btn btn-secondary btn-sm"
            >
              Мой профиль
            </button>
          )}
          <button
            onClick={handleSendMessage}
            className="btn btn-primary btn-sm"
          >
            Написать
          </button>
          {canLeaveReview && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn btn-outline btn-sm"
            >
              {reviewCount > 0 ? 'Оставить отзыв' : 'Оставить первый отзыв'}
            </button>
          )}
        </div>
        {badges.length > 0 && (
          <div className="badges">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className="badge"
              >
                {badge.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Форма отзыва */}
      {showReviewForm && (
        <div className="review-form-section">
          <h2 className="review-form-title">
            {reviewCount > 0 ? 'Оставить отзыв' : 'Оставить первый отзыв'}
          </h2>
          <form onSubmit={handleCreateReview} className="review-form">
            <div className="rating-input">
              <label className="rating-label">Ваша оценка</label>
              <div className="star-buttons">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="star-button"
                  >
                    {reviewForm.rating >= star ? (
                      <span className="star-filled">★</span>
                    ) : (
                      <span className="star-empty">☆</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Ваш комментарий..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="review-textarea"
              rows="3"
            />
            <div className="review-form-buttons">
              <button type="submit" className="btn btn-primary">
                Отправить
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn btn-secondary"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список отзывов */}
      {showReviews && reviewsLoaded && reviews.length > 0 && (
        <div className="reviews-section">
          <h2 className="reviews-title">Отзывы о {getDisplayName(user)}</h2>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-content">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.reviewer?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="reviewer-details">
                      <div className="reviewer-name-rating">
                        <span className="reviewer-name">{review.reviewer?.username || 'Аноним'}</span>
                        <span className="review-rating">{'★'.repeat(review.rating)}</span>
                      </div>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  {review.pet && (
                    <p className="review-pet">
                      Сделка: <span className="pet-name">{review.pet.name}</span>
                    </p>
                  )}
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Вкладки */}
      <div className="profile-tabs-container">
        <div className="profile-tabs-nav">
          <button
            onClick={() => setActiveTab('pets')}
            className={`profile-tab ${
              activeTab === 'pets' ? 'profile-tab-active' : ''
            }`}
          >
            Объявления ({pets.length})
          </button>
        </div>
        <div className="profile-tabs-content">
          {activeTab === 'pets' && (
            <div>
              {pets.length > 0 && (
                <h3 className="pets-section-title">Объявления пользователя</h3>
              )}
              {pets.length > 0 ? (
                <div className="pets-grid">
                  {pets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} size="small" />
                  ))}
                </div>
              ) : (
                <div className="no-pets">
                  <div className="no-pets-icon">🐾</div>
                  <h3 className="no-pets-title">Нет объявлений</h3>
                  <p className="no-pets-text">Пользователь пока не размещал объявления</p>
                </div>
              )}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-btn pagination-prev"
                  >
                    &lt;
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`pagination-btn ${
                        page === i + 1 ? 'pagination-btn-active' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn pagination-next"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;