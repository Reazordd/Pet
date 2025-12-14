// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ads");
  const [stats, setStats] = useState({});
  const [myAds, setMyAds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  });

  useEffect(() => {
    if (!checkToken()) return logout();
    fetchProfile();
    fetchStats();
    fetchMyAds();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me/");
      setUserData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Ошибка загрузки профиля");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/profile/stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке статистики:", err);
      toast.error("Ошибка загрузки статистики");
    }
  };

  const fetchMyAds = async () => {
    try {
      const res = await api.get(`/pets/?owner=true&page=${page}`);
      setMyAds(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / 12));
    } catch (err) {
      console.error("Ошибка при загрузке объявлений:", err);
      setMyAds([]);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, [page]);

  const handleChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, avatar: file });
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(userData).forEach(([k, v]) => {
        if (v instanceof File) {
          data.append(k, v);
        } else if (typeof v === 'string' || typeof v === 'number') {
          data.append(k, v);
        }
      });
      const res = await api.put("/profile/me/update/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUserData(res.data);
      setImagePreview(null);
      toast.success("✅ Профиль обновлён");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка обновления профиля");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password2) {
      toast.error("Пароли не совпадают");
      return;
    }
    try {
      await api.post("/password-change/", {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
        new_password_confirm: passwords.new_password2
      });
      toast.success("Пароль успешно изменён!");
      setPasswords({ old_password: "", new_password: "", new_password2: "" });
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при смене пароля");
    }
  };

  const formatPrice = (price) => {
    if (price === null) return "Бесплатно";
    return new Intl.NumberFormat('ru-RU').format(price) + " ₽";
  };

  if (loading && !userData.username) return <div className="text-center mt-10">Загрузка...</div>;

  return (
    <div className="profile-container min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Шапка профиля в стиле Avito */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-4 md:mb-0 md:mr-6">
              {imagePreview ? (
                <img src={imagePreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
              ) : userData.avatar ? (
                <img src={userData.avatar} alt={userData.username} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-700 border-4 border-white shadow">
                  {userData.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{userData.username}</h1>
              {userData.email && <p className="text-gray-600">{userData.email}</p>}
              {userData.location && <p className="text-gray-600">📍 {userData.location}</p>}
              {userData.bio && <p className="mt-2 text-gray-700 max-w-2xl">{userData.bio}</p>}
            </div>
          </div>
        </div>

        {/* Вкладки как в Avito */}
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex overflow-x-auto px-2 border-b">
            {[
              { id: "ads", label: "Мои объявления" },
              { id: "messages", label: "Сообщения" },
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

        {/* Контент вкладок */}
        <div className="bg-white rounded-b-xl shadow-sm p-6">
          {/* === Мои объявления === */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAds.length ? (
                  myAds.map((ad) => (
                    <div key={ad.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={ad.image || "/images/placeholder-pet.jpg"}
                        alt={ad.name || "Питомец"}
                        className="w-full h-48 object-cover"
                        onError={(e) => (e.target.src = "/images/placeholder-pet.jpg")}
                      />
                      <div className="p-4">
                        <h3 className="font-bold truncate">{ad.name || "Без имени"}</h3>
                        <p className="text-lg font-semibold text-blue-600">{formatPrice(ad.price)}</p>
                        <p className="text-gray-600 text-sm">{ad.city}</p>
                        <p className={`mt-2 text-sm ${ad.is_active ? "text-green-600" : "text-red-600"}`}>
                          {ad.is_active ? "Активно" : "Скрыто"}
                        </p>
                        <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                          Редактировать
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center py-8">Нет объявлений</p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border rounded disabled:opacity-50"
                  >
                    Назад
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1.5 rounded ${
                        page === i + 1 ? 'bg-blue-600 text-white' : 'border'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border rounded disabled:opacity-50"
                  >
                    Вперёд
                  </button>
                </div>
              )}
            </div>
          )}

          {/* === Сообщения === */}
          {activeTab === "messages" && (
            <div className="messages-tab">
              <h2 className="text-xl font-semibold mb-4">Сообщения</h2>
              <p className="text-gray-600">Перейдите в раздел{" "}
                <button
                  onClick={() => navigate('/messages')}
                  className="text-blue-600 underline font-medium"
                >
                  все сообщения
                </button> для полного списка.
              </p>
            </div>
          )}

          {/* === Настройки профиля === */}
          {activeTab === "settings" && (
            <form onSubmit={handleSubmit} className="max-w-2xl">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Фото профиля</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                  ) : userData.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
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
                  value={userData.phone || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="+7 (999) 999-99-99"
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

          {/* === Безопасность === */}
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