// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import "../styles/Profile.css";

function Profile() {
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
      // ✅ Исправлено: теперь вызывает /api/profile/me/
      const res = await api.get("/profile/me/");
      setUserData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Ошибка загрузки профиля");
    }
  };

  const fetchStats = async () => {
    try {
      // ✅ Исправлено: теперь вызывает /api/profile/stats/
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
      // ✅ Исправлено: теперь вызывает /api/profile/me/update/
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
      // ✅ Исправлено: теперь вызывает /api/password-change/
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

  return (
    <div className="profile-container dark:bg-gray-900 min-h-screen">
      <div className="profile-card max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">👤 Мой профиль</h1>

        {/* Вкладки */}
        <div className="tabs mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("ads")}
            className={`pb-2 px-4 ${activeTab === "ads" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Мои объявления
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-2 px-4 ${activeTab === "settings" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Настройки профиля
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-2 px-4 ${activeTab === "security" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Безопасность
          </button>
        </div>

        {/* === Мои объявления === */}
        {activeTab === "ads" && (
          <div>
            <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="stat-box bg-blue-50 p-4 rounded text-center">
                <h3 className="font-bold text-lg">{stats.total_pets || 0}</h3>
                <p className="text-gray-600">Всего</p>
              </div>
              <div className="stat-box bg-green-50 p-4 rounded text-center">
                <h3 className="font-bold text-lg">{stats.active_pets || 0}</h3>
                <p className="text-gray-600">Активные</p>
              </div>
              <div className="stat-box bg-yellow-50 p-4 rounded text-center">
                <h3 className="font-bold text-lg">{Math.round(stats.avg_price || 0)} ₽</h3>
                <p className="text-gray-600">Средняя цена</p>
              </div>
              <div className="stat-box bg-purple-50 p-4 rounded text-center">
                <h3 className="font-bold text-lg">{stats.total_reviews || 0}</h3>
                <p className="text-gray-600">Отзывов</p>
              </div>
            </div>

            <div className="ads-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAds.length ? (
                myAds.map((ad) => (
                  <div key={ad.id} className="ad-card border rounded p-4 hover:shadow-md">
                    <img
                      src={ad.image || "/images/placeholder-pet.jpg"}
                      alt={ad.name || "Питомец"}
                      className="w-full h-40 object-cover rounded mb-3"
                      onError={(e) => (e.target.src = "/images/placeholder-pet.jpg")}
                    />
                    <h3 className="font-bold truncate">{ad.name || "Без имени"}</h3>
                    <p className="price text-lg font-semibold">{formatPrice(ad.price)}</p>
                    <p className="text-gray-600 truncate">{ad.city}</p>
                    <p className={`status ${ad.is_active ? "text-green-600" : "text-red-600"}`}>
                      {ad.is_active ? "Активно" : "Скрыто"}
                    </p>
                    <button className="edit-btn mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Редактировать
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 col-span-full">Нет объявлений</p>
              )}
            </div>

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
        )}

        {/* === Настройки профиля === */}
        {activeTab === "settings" && (
          <form onSubmit={handleSubmit} className="profile-settings">
            <div className="profile-avatar mb-4 flex flex-col items-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
              ) : userData.avatar ? (
                <img src={userData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center">
                  <span className="text-gray-500">👤</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>

            <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                name="first_name"
                value={userData.first_name || ""}
                onChange={handleChange}
                placeholder="Имя"
                className="p-2 border rounded"
              />
              <input
                name="last_name"
                value={userData.last_name || ""}
                onChange={handleChange}
                placeholder="Фамилия"
                className="p-2 border rounded"
              />
            </div>

            <input
              name="username"
              value={userData.username || ""}
              onChange={handleChange}
              required
              placeholder="Логин"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              name="email"
              type="email"
              value={userData.email || ""}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              name="phone"
              value={userData.phone || ""}
              onChange={handleChange}
              placeholder="+7 (999) 999-99-99"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="bio"
              value={userData.bio || ""}
              onChange={handleChange}
              placeholder="О себе"
              className="w-full p-2 border rounded mb-4"
              rows="4"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </form>
        )}

        {/* === Безопасность === */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordChange} className="security-form">
            <h2 className="text-xl font-semibold mb-4">🔒 Смена пароля</h2>
            <input
              type="password"
              placeholder="Старый пароль"
              value={passwords.old_password}
              onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="password"
              placeholder="Повторите новый пароль"
              value={passwords.new_password2}
              onChange={(e) => setPasswords({ ...passwords, new_password2: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Изменить пароль
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;