// frontend/src/pages/EditPet.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function EditPet() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const res = await api.get(`/pets/${id}/`);
      const pet = res.data;
      setFormData({
        name: pet.name || '',
        species: pet.species,
        breed: pet.breed || '',
        age: pet.age || '',
        price: pet.price || '',
        offer_type: pet.offer_type,
        city: pet.city,
        description: pet.description || '',
      });
      const imageUrls = pet.images.map(img => img.image);
      setImages(imageUrls);
    } catch (err) {
      toast.error('Не удалось загрузить объявление');
      navigate('/pets');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    setSubmitting(true);
    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'price' && formData.offer_type !== 'sale') return;
        if (value !== '') data.append(key, value);
      });

      const newFiles = images.filter(img => img instanceof File);
      if (newFiles.length > 0) {
        newFiles.forEach(img => data.append('images', img));
      }

      await api.put(`/pets/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('✅ Объявление обновлено!');
      navigate(`/pets/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Редактировать объявление</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 🔥 Блок загрузки фото — Avito стиль */}
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
                  src={typeof file === 'string' ? file : URL.createObjectURL(file)}
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

        {/* Поля формы */}
        <div>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Не обязательно"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Вид животного</label>
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
            <label className="block mb-1">Тип объявления</label>
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
        </div>

        <div>
          <label className="block mb-1">Порода</label>
          <input
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Возраст (лет)</label>
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="30"
            />
          </div>

          {formData.offer_type === 'sale' && (
            <div>
              <label className="block mb-1">Цена (₽)</label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1">Город</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}