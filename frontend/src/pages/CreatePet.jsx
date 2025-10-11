import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function CreatePet() {
  const [formData, setFormData] = useState({
    name: "",
    breed: "dog",
    age: "",
    description: "",
    price: "",
    category_id: "",
    photo: null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить категории");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photo: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });

    try {
      const response = await api.post("/pets/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Объявление успешно добавлено!");
      navigate(`/pets/${response.data.id}`);
    } catch (error) {
      toast.error("Ошибка при создании объявления");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-pet">
      <div className="page-header">
        <h1>Создать объявление</h1>
      </div>

      <form onSubmit={handleSubmit} className="pet-form">
        <div className="form-group">
          <label>Имя питомца *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Категория *</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Порода *</label>
          <select name="breed" value={formData.breed} onChange={handleChange}>
            <option value="dog">Собака</option>
            <option value="cat">Кошка</option>
            <option value="bird">Птица</option>
            <option value="fish">Рыба</option>
            <option value="rodent">Грызун</option>
            <option value="reptile">Рептилия</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div className="form-group">
          <label>Возраст (лет)</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Цена (₽)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Опишите питомца..."
          />
        </div>

        <div className="form-group">
          <label>Фото</label>
          <input type="file" name="photo" onChange={handleFileChange} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Сохранение..." : "💾 Создать объявление"}
        </button>
      </form>
    </div>
  );
}

export default CreatePet;
