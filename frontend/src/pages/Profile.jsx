import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import { buildImageUrl } from "../utils/image";
import PetCard from "../components/PetCard";
import MessagesList from "../components/MessagesList";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ads");
  const [stats, setStats] = useState({});

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  });

  const [receivedReviews, setReceivedReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState('received');

  useEffect(() => {
    if (!checkToken()) return logout();
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile/me/");
      setUserData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Ошибка загрузки профиля");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/auth/profile/stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке статистики:", err);
      toast.error("Ошибка загрузки статистики");
    }
  };

  const fetchReviews = async () => {
    if (!userData.id) return;
    setReviewsLoading(true);
    try {
      const [receivedRes, givenRes] = await Promise.all([
        api.get(`/reviews/user/${userData.id}/reviews/`),
        api.get(`/reviews/user/${userData.id}/given-reviews/`)
      ]);
      setReceivedReviews(receivedRes.data.reviews || []);
      setGivenReviews(givenRes.data.reviews || []);
    } catch (err) {
      console.error("Ошибка загрузки отзывов:", err);
      toast.error("Не удалось загрузить отзывы");
    } finally {
      setReviewsLoading(false);
    }
  };

  // 🔥 ДОБАВЛЕНО: загрузка сообщений при активной вкладке
  useEffect(() => {
    if ((activeTab === "reviews" || activeTab === "messages") && userData.id) {
      if (activeTab === "reviews") {
        fetchReviews();
      }
      // Для "messages" — MessagesList сам загружает данные
    }
  }, [activeTab, userData.id]);

  const handleChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d+\s]/g, '');
    if (value.length > 15) return;
    setUserData(prev => ({ ...prev, phone: value }));
  };

  const normalizePhone = (phone) => {
    if (!phone) return '';
    let clean = phone.replace(/[^\d+]/g, '');
    if (!clean.startsWith('+')) {
      clean = '+' + clean;
    }
    return clean;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const phoneToSend = normalizePhone(userData.phone);
      if (phoneToSend && phoneToSend.length >= 10) {
        data.append('phone', phoneToSend);
      }

      ['first_name', 'last_name', 'username', 'email', 'bio', 'location'].forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          data.append(key, userData[key]);
        }
      });

      const res = await api.put("/auth/profile/me/update/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUserData(res.data);
      setImagePreview(null);
      setAvatarFile(null);
      toast.success("✅ Профиль обновлён");
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      if (errorData) {
        if (errorData.phone) {
          toast.error(errorData.phone);
        } else if (errorData.email) {
          toast.error(errorData.email);
        } else if (errorData.username) {
          toast.error(errorData.username);
        } else if (errorData.location) {
          toast.error(errorData.location);
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else {
          toast.error("Ошибка обновления профиля");
        }
      } else {
        toast.error("Ошибка обновения профиля");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.new_password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (passwords.new_password !== passwords.new_password2) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      await api.post("/auth/password/change/", {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      toast.success("Пароль успешно изменён!");
      setPasswords({ old_password: "", new_password: "", new_password2: "" });
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Ошибка при смене пароля");
      }
    }
  };

  const getReviewText = (count) => {
    if (count === 0) return 'отзывов';
    if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'отзыва';
    return 'отзывов';
  };

  // 🔥 ДОБАВЛЕНО: функция для золотых звёзд
  const renderRatingStars = (rating = 5) => {
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

  if (loading && !userData.username) {
    return (
      <div className="content text-center mt-10">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка профиля...</p>
      </div>
    );
  }

  const reviewCount = userData.review_count || 0;
  const myAds = userData.pets || [];

  const getDisplayName = (user) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return user.username || 'Пользователь';
  };

  return (
    <div className="content">
      {/* Заголовок профиля */}
      <div className="profile-header">
        <div className="avatar-lg-container">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="avatar-lg" />
          ) : userData.avatar ? (
            <img
              src={buildImageUrl(userData.avatar)}
              alt={getDisplayName(userData)}
              className="avatar-lg"
            />
          ) : (
            <div className="avatar-placeholder">
              {getDisplayName(userData)?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="header-info">
          <h1>{getDisplayName(userData)}</h1>
          {userData.location && (
            <p>
              <i className="fas fa-map-marker-alt mr-2"></i>
              {userData.location}
            </p>
          )}
          {userData.bio && <p className="bio">{userData.bio}</p>}
        </div>
      </div>

      {/* Рейтинг — ТЕПЕРЬ ЗОЛОТЫЕ ЗВЁЗДЫ */}
      <div className="rating-stars">
        <span className="rating-value">5.0</span>
        <div className="stars">{renderRatingStars(5)}</div>
        <span className="review-count">
          {reviewCount} {getReviewText(reviewCount)}
        </span>
      </div>

      {/* Вкладки */}
      <div className="profile-tabs-container">
        <div className="profile-tabs-nav">
          {[
            { id: "ads", label: "Мои объявления" },
            { id: "messages", label: "Сообщения" },
            { id: "reviews", label: `Отзывы (${reviewCount})` },
            { id: "settings", label: "Настройки профиля" },
            { id: "security", label: "Безопасность" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`profile-tab ${activeTab === tab.id ? 'profile-tab-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="profile-tabs-content">
          {activeTab === "ads" && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{stats.total_pets || 0}</div>
                  <div className="stat-label">Всего</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🟢</div>
                  <div className="stat-value">{stats.active_pets || 0}</div>
                  <div className="stat-label">Активные</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{Math.round(stats.avg_price || 0)} ₽</div>
                  <div className="stat-label">Средняя цена</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{stats.total_reviews || 0}</div>
                  <div className="stat-label">Отзывов</div>
                </div>
              </div>

              {myAds.length > 0 ? (
                <div className="pets-grid">
                  {myAds.map((ad) => (
                    <PetCard key={ad.id} pet={ad} size="small" />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="icon">📋</div>
                  <h3>Нет объявлений</h3>
                  <p>Разместите первое объявление!</p>
                  <button
                    onClick={() => navigate('/create')}
                    className="btn btn-primary"
                  >
                    Создать объявление
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Сообщения</h2>
              <MessagesList />
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Отзывы</h2>

              <div className="review-tabs">
                <button
                  className={`review-tab ${activeReviewTab === 'received' ? 'active' : ''}`}
                  onClick={() => setActiveReviewTab('received')}
                >
                  Полученные ({userData.review_count || 0})
                </button>
                <button
                  className={`review-tab ${activeReviewTab === 'given' ? 'active' : ''}`}
                  onClick={() => setActiveReviewTab('given')}
                >
                  Оставленные ({givenReviews.length})
                </button>
              </div>

              {reviewsLoading ? (
                <p className="text-gray-500">Загрузка...</p>
              ) : activeReviewTab === 'received' ? (
                receivedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {receivedReviews.map((rev) => (
                      <div key={rev.id} className="review-item">
                        <div className="flex items-start space-x-3">
                          <div className="reviewer-avatar">
                            {(rev.reviewer?.username && typeof rev.reviewer.username === 'string' && rev.reviewer.username.charAt(0).toUpperCase()) || '?'}
                          </div>
                          <div className="reviewer-info">
                            <div className="flex items-center space-x-2">
                              <span className="reviewer-name">{rev.reviewer?.username || 'Аноним'}</span>
                              <span className="rating">{'★'.repeat(rev.rating)}</span>
                            </div>
                            {rev.pet && (
                              <p className="pet-name mt-1">
                                Сделка: {rev.pet.name}
                              </p>
                            )}
                            <p className="comment">{rev.comment}</p>
                            <p className="date">
                              {new Date(rev.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Нет полученных отзывов</p>
                )
              ) : (
                givenReviews.length > 0 ? (
                  <div className="space-y-4">
                    {givenReviews.map((rev) => (
                      <div key={rev.id} className="review-item">
                        <div className="flex items-start space-x-3">
                          <div className="reviewer-avatar">
                            {(rev.reviewed?.username && typeof rev.reviewed.username === 'string' && rev.reviewed.username.charAt(0).toUpperCase()) || '?'}
                          </div>
                          <div className="reviewer-info">
                            <div className="flex items-center space-x-2">
                              <span className="reviewer-name">Для: {rev.reviewed?.username || 'Аноним'}</span>
                              <span className="rating">{'★'.repeat(rev.rating)}</span>
                            </div>
                            {rev.pet && (
                              <p className="pet-name mt-1">
                                Сделка: {rev.pet.name}
                              </p>
                            )}
                            <p className="comment">{rev.comment}</p>
                            <p className="date">
                              {new Date(rev.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Вы ещё не оставили отзывов</p>
                )
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <form onSubmit={handleSubmit} className="profile-settings-form">
              <div className="form-group">
                <label>Фото профиля</label>
                <div className="avatar-upload">
                  {imagePreview ? (
                    <div className="avatar-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  ) : userData.avatar ? (
                    <div className="avatar-preview">
                      <img src={buildImageUrl(userData.avatar)} alt="Avatar" />
                    </div>
                  ) : (
                    <div className="avatar-placeholder">
                      {getDisplayName(userData)?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="file-input-btn">
                      Выбрать файл
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    name="first_name"
                    value={userData.first_name || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Фамилия</label>
                  <input
                    name="last_name"
                    value={userData.last_name || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Логин*</label>
                <input
                  name="username"
                  value={userData.username || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Телефон*</label>
                <input
                  name="phone"
                  type="tel"
                  value={userData.phone || ""}
                  onChange={handlePhoneChange}
                  placeholder="+7 999 123-45-67"
                />
              </div>

              <div className="form-group">
                <label>Город *</label>
                <input
                  name="location"
                  value={userData.location || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>О себе</label>
                <textarea
                  name="bio"
                  value={userData.bio || ""}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <div className="max-w-md">
              <h2 className="text-xl font-bold mb-4">🔒 Смена пароля</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="form-group">
                  <label>Старый пароль*</label>
                  <input
                    type="password"
                    value={passwords.old_password}
                    onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Новый пароль*</label>
                  <input
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Повторите новый пароль*</label>
                  <input
                    type="password"
                    value={passwords.new_password2}
                    onChange={(e) => setPasswords({ ...passwords, new_password2: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Изменить пароль
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="profile-footer">
        <a href="/terms">Пользовательское соглашение</a>
        <span> • </span>
        <a href="/privacy">Политика конфиденциальности</a>
        © {new Date().getFullYear()} PetMarket
      </div>
    </div>
  );
}

export default Profile;