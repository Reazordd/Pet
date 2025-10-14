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
      const response = await api.get("/categories/");
      setCategories(response.data.results ?? response.data);
    } catch {
      toast.error("Ошибка при загрузке категорий");
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
      data.append("name", formData.name);
      data.append("breed", formData.breed);
      data.append("age", formData.age);
      data.append("description", formData.description);
      if (formData.price) data.append("price", formData.price);
      if (formData.photo) data.append("photo", formData.photo);
      if (formData.category) data.append("category_id", formData.category);

      await api.post("/pets/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Объявление успешно создано!");
      navigate("/mypets");
    } catch (error) {
      toast.error("Ошибка при создании объявления");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avito-form-container">
      <div className="avito-form-card">
        <h2 className="avito-title">Разместить объявление</h2>
        <form onSubmit={handleSubmit} className="avito-form">
          <div className="form-row">
            <label>Имя питомца *</label>
            <input
              type="text"
              name="name"
              placeholder="Барсик"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Возраст *</label>
            <input
              type="text"
              name="age"
              placeholder="3 месяца / 2 года"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Порода *</label>
            <input
              type="text"
              name="breed"
              placeholder="Мопс / Сфинкс / Попугай"
              value={formData.breed}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Категория *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Описание *</label>
            <textarea
              name="description"
              placeholder="Расскажите подробнее о питомце, его характере, особенностях и прививках..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div className="form-row">
            <label>Цена (₽)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Например: 5000"
            />
          </div>

          <div className="form-row file-upload">
            <label>Фото питомца</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && (
              <div className="preview-wrapper">
                <img src={imagePreview} alt="Preview" className="preview" />
              </div>
            )}
          </div>

          <button type="submit" className="avito-btn" disabled={loading}>
            {loading ? "⏳ Создание..." : "📢 Опубликовать объявление"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePet;
