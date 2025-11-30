// frontend/src/pages/CreatePet.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

function CreatePet() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    price: '',
    offer_type: 'sale',
    city: '',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Проверим размер (например, не больше 5 МБ на фото)
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (files.length !== validFiles.length) {
      toast.error('Некоторые фото больше 5 МБ и не будут загружены.');
    }
    setImages(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isSale = formData.offer_type === 'sale';
    if (isSale && !formData.price) {
      toast.error('Укажите цену для продажи');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') data.append(key, value);
    });

    images.forEach((image, index) => {
      data.append('images', image);
    });

    setLoading(true);
    try {
      await api.post('/pets/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Объявление опубликовано!');
      navigate('/pets');
    } catch (err) {
      console.error(err);
      toast.error('Не удалось создать объявление');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Добавить объявление</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Фото питомца *</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required
            className="w-full p-2 border rounded"
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Выбрано фото: {images.length}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1">Тип объявления *</label>
          <select name="offer_type" value={formData.offer_type} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="sale">Продажа</option>
            <option value="giveaway">Отдам</option>
            <option value="search">Ищу</option>
          </select>
        </div>

        <div>
          <input name="name" placeholder="Имя питомца" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <select name="species" value={formData.species} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="dog">Собака</option>
            <option value="cat">Кошка</option>
            <option value="bird">Птица</option>
            <option value="rodent">Грызун</option>
            <option value="fish">Рыба</option>
            <option value="reptile">Рептилия</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div>
          <input name="breed" placeholder="Порода (не обязательно)" value={formData.breed} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div>
          <input name="age" type="number" min="0" max="50" placeholder="Возраст (лет)" value={formData.age} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        {formData.offer_type === 'sale' && (
          <div>
            <input name="price" type="number" min="0" placeholder="Цена (₽) *" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
        )}

        <div>
          <input name="city" placeholder="Город *" value={formData.city} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div>
          <textarea name="description" placeholder="Описание" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows="4" />
        </div>

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          {loading ? 'Публикация...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
}

export default CreatePet;