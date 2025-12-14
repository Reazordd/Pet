// frontend/src/pages/SettingsTab.jsx
import React, { useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

function SettingsTab({ userData, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: userData.first_name || "",
    last_name: userData.last_name || "",
    email: userData.email || "",
    phone: userData.phone || "",
    bio: userData.bio || "",
    location: userData.location || "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      await api.put("/profile/me/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Профиль обновлён");
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error("Ошибка обновления профиля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Настройки профиля</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-6">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
          ) : userData.avatar ? (
            <img src={userData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              {userData.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Имя"
            className="p-2 border rounded"
          />
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Фамилия"
            className="p-2 border rounded"
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-2 border rounded"
            required
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+7 (999) 999-99-99"
            className="p-2 border rounded"
          />
        </div>

        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="О себе"
          className="w-full p-2 border rounded"
          rows="3"
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Город"
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}

export default SettingsTab;