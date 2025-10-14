import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { checkToken, logout } from "../utils/auth";
import "../styles/Profile.css";

function Profile() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    avatar: null,
  });
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!checkToken()) {
      logout();
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile/");
      setUserData(response.data);
      setCurrentAvatar(response.data.avatar);
    } catch (error) {
      toast.error("Ошибка при загрузке профиля");
      if (error.response?.status === 401) logout();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({ ...prev, avatar: file }));

      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (userData[key]) submitData.append(key, userData[key]);
      });

      const response = await api.put("/profile/", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUserData(response.data);
      setCurrentAvatar(response.data.avatar);
      setImagePreview(null);
      toast.success("✅ Профиль обновлён");
    } catch {
      toast.error("Ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>👤 Мой профиль</h1>
        </div>

        <div className="profile-avatar">
          <div className="avatar-wrapper">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" />
            ) : currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {userData.first_name?.[0] || userData.username?.[0] || "U"}
              </div>
            )}
          </div>

          <div className="avatar-actions">
            <label htmlFor="avatar-upload" className="btn btn-secondary">
              📸 Изменить
            </label>
            <input
              type="file"
              id="avatar-upload"
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />

            {currentAvatar && (
              <button
                className="btn btn-danger"
                onClick={() => {
                  setUserData((p) => ({ ...p, avatar: "" }));
                  setCurrentAvatar("");
                }}
              >
                🗑️ Удалить
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Имя</label>
            <input
              name="first_name"
              value={userData.first_name}
              onChange={handleChange}
              placeholder="Ваше имя"
            />
          </div>

          <div className="form-group">
            <label>Фамилия</label>
            <input
              name="last_name"
              value={userData.last_name}
              onChange={handleChange}
              placeholder="Ваша фамилия"
            />
          </div>

          <div className="form-group">
            <label>Логин *</label>
            <input
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Телефон</label>
            <input
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 999-99-99"
            />
          </div>

          <div className="form-group">
            <label>Адрес</label>
            <textarea
              name="address"
              value={userData.address}
              onChange={handleChange}
              placeholder="Введите ваш адрес"
            />
          </div>

          <div className="profile-buttons">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              💾 Сохранить
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fetchProfile}
            >
              ⟳ Отменить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
