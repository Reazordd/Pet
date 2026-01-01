// frontend/src/pages/CreatePet.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const SPECIES_CHOICES = [
  { value: 'dog', label: 'Собака' },
  { value: 'cat', label: 'Кошка' },
  { value: 'bird', label: 'Птица' },
  { value: 'rodent', label: 'Грызун' },
  { value: 'fish', label: 'Рыба' },
  { value: 'reptile', label: 'Рептилия' },
  { value: 'other', label: 'Другое' },
];

const OFFER_CHOICES = [
  { value: 'sale', label: 'Продажа' },
  { value: 'giveaway', label: 'Отдам' },
  { value: 'search', label: 'Ищу' },
];

export default function CreatePet() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    birth_date: '',
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert('Можно загрузить максимум 5 фото');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Файл "${file.name}" больше 5 МБ и будет пропущен.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`Файл "${file.name}" не является изображением.`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Добавьте хотя бы одно фото');
      return;
    }

    if (formData.offer_type === 'sale' && !formData.price) {
      toast.error('Укажите цену для продажи');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') data.append(key, value);
    });

    images.forEach(img => data.append('images', img));

    setLoading(true);
    try {
      await api.post('/pets/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('✅ Объявление опубликовано!');
      navigate('/pets');
    } catch (err) {
      console.error(err);
      toast.error('Не удалось создать объявление');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Добавить объявление</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Фото как у Avito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Фотографии (максимум 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((file, index) => (
              <div
                key={`photo-${index}`}
                className="relative"
                style={{ width: '80px', height: '80px' }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Фото ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
                >
                  ×
                </button>
              </div>
            ))}

            {Array.from({ length: 5 - images.length }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                style={{
                  width: '80px',
                  height: '80px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Поддерживаются JPG, PNG. Макс. размер файла — 5 МБ.
          </p>
        </div>

        <div>
          <label className="block mb-1">Тип объявления *</label>
          <select
            name="offer_type"
            value={formData.offer_type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {OFFER_CHOICES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            name="name"
            placeholder="Имя питомца"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {SPECIES_CHOICES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            name="breed"
            placeholder="Порода (не обязательно)"
            value={formData.breed}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Дата рождения */}
        <div>
          <label className="block mb-1">Дата рождения</label>
          <input
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {formData.offer_type === 'sale' && (
          <div>
            <input
              name="price"
              type="number"
              min="0"
              placeholder="Цена (₽) *"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <div>
          <input
            name="city"
            placeholder="Город *"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <textarea
            name="description"
            placeholder="Описание"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Публикация...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
}