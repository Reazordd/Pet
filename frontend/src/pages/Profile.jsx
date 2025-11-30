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
  const [passwords, setPasswords] = useState({
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
    } catch {
      toast.error("Ошибка загрузки профиля");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/profile/stats/");  // ✅ Теперь будет работать
      setStats(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке статистики:", err);
      toast.error("Ошибка загрузки статистики");
    }
  };

  const fetchMyAds = async () => {
    try {
      const res = await api.get("/pets/?owner=true");  // ✅ Теперь будет работать
      setMyAds(res.data.results || []);
    } catch (err) {
      console.error("Ошибка при загрузке объявлений:", err);
      setMyAds([]);
    }
  };

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
      Object.entries(userData).forEach(([k, v]) => v && data.append(k, v));
      const res = await api.put("/profile/me/update/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      }); // 🔥 Исправлен маршрут
      setUserData(res.data);
      setImagePreview(null);
      toast.success("✅ Профиль обновлён");
    } catch {
      toast.error("Ошибка обновления");
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
      await api.post("/password-reset/confirm/", { password: passwords.new_password });
      toast.success("Пароль успешно изменён!");
      setPasswords({ new_password: "", new_password2: "" });
    } catch {
      toast.error("Ошибка при смене пароля");
    }
  };

  return (
    <div className="profile-container dark:bg-gray-900 min-h-screen">
      <div className="profile-card">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">👤 Мой профиль</h1>

        {/* Вкладки */}
        <div className="tabs mb-6">
          <button
            onClick={() => setActiveTab("ads")}
            className={activeTab === "ads" ? "active-tab" : ""}
          >
            Мои объявления
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={activeTab === "settings" ? "active-tab" : ""}
          >
            Настройки профиля
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={activeTab === "security" ? "active-tab" : ""}
          >
            Безопасность
          </button>
        </div>

        {/* === Мои объявления === */}
        {activeTab === "ads" && (
          <div>
            <div className="stats-grid">
              <div className="stat-box">Всего: {stats.total_pets || 0}</div>
              <div className="stat-box">Активные: {stats.active_pets || 0}</div>
              <div className="stat-box">Средняя цена: {Math.round(stats.avg_price || 0)} ₽</div>
              <div className="stat-box">Отзывов: {stats.total_reviews || 0}</div>
            </div>

            <div className="ads-grid">
              {myAds.length ? (
                myAds.map((ad) => (
                  <div key={ad.id} className="ad-card">
                    <img src={ad.image || "/no-photo.jpg"} alt={ad.title} />
                    <div className="ad-info">
                      <h3>{ad.title}</h3>
                      <p className="price">{ad.price} ₽</p>
                      <p className={ad.is_active ? "status-active" : "status-hidden"}>
                        {ad.is_active ? "Активно" : "Скрыто"}
                      </p>
                      <button className="edit-btn">Редактировать</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Нет объявлений</p>
              )}
            </div>
          </div>
        )}

        {/* === Настройки профиля === */}
        {activeTab === "settings" && (
          <form onSubmit={handleSubmit}>
            <div className="profile-avatar">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : userData.avatar ? (
                <img src={userData.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">{userData.username?.[0] || "U"}</div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <input name="first_name" value={userData.first_name || ""} onChange={handleChange} placeholder="Имя" />
            <input name="last_name" value={userData.last_name || ""} onChange={handleChange} placeholder="Фамилия" />
            <input name="username" value={userData.username || ""} onChange={handleChange} required />
            <input name="email" type="email" value={userData.email || ""} onChange={handleChange} required />
            <input name="phone" value={userData.phone || ""} onChange={handleChange} placeholder="+7 (999) ..." />
            <textarea name="bio" value={userData.bio || ""} onChange={handleChange} placeholder="О себе" />
            <button type="submit" disabled={loading}>
              {loading ? "⏳ Сохраняем..." : "💾 Сохранить"}
            </button>
          </form>
        )}

        {/* === Безопасность === */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordChange} className="security-form">
            <h2>🔒 Смена пароля</h2>
            <input
              type="password"
              placeholder="Новый пароль"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            />
            <input
              type="password"
              placeholder="Повторите новый пароль"
              value={passwords.new_password2}
              onChange={(e) => setPasswords({ ...passwords, new_password2: e.target.value })}
            />
            <button type="submit">Изменить пароль</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;