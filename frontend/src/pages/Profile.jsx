// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import { buildImageUrl } from "../utils/image";
import PetCard from "../components/PetCard";
import MessagesList from "../components/MessagesList";
import "../styles/Avatar.css";

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

  useEffect(() => {
    if ((activeTab === "reviews" || activeTab === "messages") && userData.id) {
      if (activeTab === "reviews") {
        fetchReviews();
      }
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
        toast.error("Ошибка обновления профиля");
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

  if (loading && !userData.username) return <div className="text-center mt-10">Загрузка...</div>;

  const reviewCount = userData.review_count || 0;
  const myAds = userData.pets || [];

  return (
    <div className="profile-container min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Шапка профиля */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-4 md:mb-0 md:mr-6">
              {imagePreview ? (
                <div className="avatar-lg-container">
                  <img src={imagePreview} alt="Avatar" className="avatar-lg" />
                </div>
              ) : userData.avatar ? (
                <div className="avatar-lg-container">
                  <img
                    src={buildImageUrl(userData.avatar)}
                    alt={userData.username}
                    className="avatar-lg"
                  />
                </div>
              ) : (
                <div className="avatar-lg bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-700">
                  {userData.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{userData.username}</h1>

              {reviewCount > 0 && (
                <div className="mt-2 flex items-center">
                  <span className="text-lg font-bold text-gray-900">5.0</span>
                  <span className="text-yellow-400 ml-1">★★★★★</span>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="text-blue-600 font-medium ml-2 hover:underline"
                  >
                    {reviewCount} {getReviewText(reviewCount)}
                  </button>
                </div>
              )}

              {userData.email && <p className="text-gray-600">{userData.email}</p>}
              {userData.location && <p className="text-gray-600">📍 {userData.location}</p>}
              {userData.bio && <p className="mt-2 text-gray-700 max-w-2xl">{userData.bio}</p>}
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex overflow-x-auto px-2 border-b">
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
                className={`px-4 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-b-xl shadow-sm p-6">
          {activeTab === "ads" && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Всего", value: stats.total_pets || 0, color: "bg-blue-50 text-blue-800" },
                  { label: "Активные", value: stats.active_pets || 0, color: "bg-green-50 text-green-800" },
                  { label: "Средняя цена", value: `${Math.round(stats.avg_price || 0)} ₽`, color: "bg-yellow-50 text-yellow-800" },
                  { label: "Отзывов", value: stats.total_reviews || 0, color: "bg-purple-50 text-purple-800" }
                ].map((stat, idx) => (
                  <div key={idx} className={`${stat.color} p-4 rounded-lg text-center`}>
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {myAds.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAds.map((ad) => (
                    <PetCard key={ad.id} pet={ad} size="small" />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Нет объявлений</p>
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Сообщения</h2>
              <MessagesList />
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Отзывы</h2>

              <div className="flex border-b mb-4">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeReviewTab === 'received'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveReviewTab('received')}
                >
                  Полученные ({userData.review_count || 0})
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeReviewTab === 'given'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveReviewTab('given')}
                >
                  Оставленные ({givenReviews.length})
                </button>
              </div>

              {reviewsLoading ? (
                <p>Загрузка отзывов...</p>
              ) : activeReviewTab === 'received' ? (
                receivedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {receivedReviews.map((rev) => (
                      <div key={rev.id} className="border-b pb-4">
                        <div className="flex justify-between">
                          <span className="font-medium">{rev.reviewer?.username || "Аноним"}</span>
                          <div className="flex items-center">
                            <span className="text-yellow-500">{"★".repeat(rev.rating)}</span>
                            <span className="text-gray-500 text-sm ml-2">
                              {new Date(rev.created_at).toLocaleDateString("ru-RU", {
                                day: 'numeric',
                                month: 'long'
                              })}
                            </span>
                          </div>
                        </div>
                        {rev.pet && (
                          <p className="text-sm text-gray-600 mt-1">
                            Сделка состоялась · {rev.pet.name || rev.pet.title}
                          </p>
                        )}
                        <p className="mt-2 text-gray-800">{rev.comment}</p>
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
                      <div key={rev.id} className="border-b pb-4">
                        <div className="flex justify-between">
                          <span className="font-medium">Для: {rev.reviewed?.username || "Аноним"}</span>
                          <div className="flex items-center">
                            <span className="text-yellow-500">{"★".repeat(rev.rating)}</span>
                            <span className="text-gray-500 text-sm ml-2">
                              {new Date(rev.created_at).toLocaleDateString("ru-RU", {
                                day: 'numeric',
                                month: 'long'
                              })}
                            </span>
                          </div>
                        </div>
                        {rev.pet && (
                          <p className="text-sm text-gray-600 mt-1">
                            Сделка состоялась · {rev.pet.name || rev.pet.title}
                          </p>
                        )}
                        <p className="mt-2 text-gray-800">{rev.comment}</p>
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
            <form onSubmit={handleSubmit} className="max-w-2xl">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Фото профиля</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="avatar-md">
                      <img src={imagePreview} alt="Preview" className="avatar-md" />
                    </div>
                  ) : userData.avatar ? (
                    <div className="avatar-md">
                      <img
                        src={buildImageUrl(userData.avatar)}
                        alt="Avatar"
                        className="avatar-md"
                      />
                    </div>
                  ) : (
                    <div className="avatar-md bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">👤</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input
                    name="first_name"
                    value={userData.first_name || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                  <input
                    name="last_name"
                    value={userData.last_name || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                <input
                  name="username"
                  value={userData.username || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={userData.email || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  name="phone"
                  type="tel"
                  value={userData.phone || ""}
                  onChange={handlePhoneChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="+380 99 123 45 67 или +7 999 123-45-67"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Город *</label>
                <input
                  name="location"
                  value={userData.location || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                <textarea
                  name="bio"
                  value={userData.bio || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                {loading ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <div className="max-w-md">
              <h2 className="text-xl font-semibold mb-4">🔒 Смена пароля</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Старый пароль</label>
                  <input
                    type="password"
                    value={passwords.old_password}
                    onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                  <input
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Повторите новый пароль</label>
                  <input
                    type="password"
                    value={passwords.new_password2}
                    onChange={(e) => setPasswords({ ...passwords, new_password2: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                  Изменить пароль
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;