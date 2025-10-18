import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import "../styles/Profile.css";

function Profile() {
  const [userData, setUserData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkToken()) return logout();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/");
      setUserData(res.data);
    } catch {
      toast.error("Ошибка загрузки профиля");
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
      const res = await api.put("/profile/", data, { headers: { "Content-Type": "multipart/form-data" } });
      setUserData(res.data);
      setImagePreview(null);
      toast.success("✅ Профиль обновлён");
    } catch {
      toast.error("Ошибка обновления");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>👤 Мой профиль</h1>
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

        <form onSubmit={handleSubmit}>
          <input name="first_name" value={userData.first_name || ""} onChange={handleChange} placeholder="Имя" />
          <input name="last_name" value={userData.last_name || ""} onChange={handleChange} placeholder="Фамилия" />
          <input name="username" value={userData.username || ""} onChange={handleChange} required />
          <input name="email" type="email" value={userData.email || ""} onChange={handleChange} required />
          <input name="phone" value={userData.phone || ""} onChange={handleChange} placeholder="+7 (999) ..." />
          <textarea name="address" value={userData.address || ""} onChange={handleChange} placeholder="Адрес" />
          <button type="submit" disabled={loading}>{loading ? "⏳ Сохраняем..." : "💾 Сохранить"}</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
