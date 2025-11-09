// frontend/src/pages/CreatePet.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import "../styles/CreatePet.css";

function CreatePet() {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    description: "",
    price: "",
    category: "",
    photo: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/");
      setCategories(res.data.results ?? res.data);
    } catch {
      toast.error("Ошибка загрузки категорий 🐶");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((p) => ({ ...p, photo: file }));
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
      Object.entries(formData).forEach(([k, v]) => v && data.append(k === "category" ? "category_id" : k, v));
      await api.post("/pets/", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("🎉 Объявление создано!");
      navigate("/mypets");
    } catch (err) {
      toast.error("Ошибка при создании объявления 😿");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avito-form-container">
      <div className="avito-form-card">
        <h2 className="avito-title">Разместить объявление</h2>
        <form onSubmit={handleSubmit} className="avito-form">
          <label>Имя питомца *</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label>Возраст *</label>
          <input name="age" value={formData.age} onChange={handleChange} required />

          <label>Порода *</label>
          <input name="breed" value={formData.breed} onChange={handleChange} required />

          <label>Категория *</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Выберите категорию</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <label>Описание *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} />

          <label>Цена (₽)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="5000" />

          <label>Фото питомца</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" className="preview" />}

          <button type="submit" className="avito-btn" disabled={loading}>
            {loading ? "⏳ Создание..." : "📢 Опубликовать"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePet;
