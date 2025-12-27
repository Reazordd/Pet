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
      setImages(pet.images || []);
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

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();

      // Добавляем текстовые поля
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'price' && formData.offer_type !== 'sale') return;
        if (value !== '') data.append(key, value);
      });

      // Добавляем новые фото
      images.forEach(img => {
        if (img instanceof File) {
          data.append('images', img);
        }
      });

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
        <div>
          <label className="block mb-1">Имя питомца</label>
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

        <div>
          <label className="block mb-1">Фото (можно заменить)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          {images.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Загружено {images.length} файлов
            </div>
          )}
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