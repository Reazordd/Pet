// frontend/src/pages/AdminAds.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';

function AdminAds() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await api.get('/admin/pets/'); // 🔥 Новый эндпоинт
      setPets(res.data.results || res.data);
    } catch (err) {
      toast.error('Не удалось загрузить объявления');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pet) => {
    try {
      await api.post(`/admin/pets/${pet.id}/approve/`);
      toast.success('Объявление одобрено');
      setPets(pets.map(p => p.id === pet.id ? {...p, is_approved: true} : p));
    } catch (err) {
      toast.error('Ошибка при одобрении');
    }
  };

  const handleHide = async (pet) => {
    try {
      await api.post(`/admin/pets/${pet.id}/hide/`);
      toast.success(`Объявление ${pet.is_hidden ? 'показано' : 'скрыто'}`);
      setPets(pets.map(p => p.id === pet.id ? {...p, is_hidden: !pet.is_hidden} : p));
    } catch (err) {
      toast.error('Ошибка при скрытии/показе');
    }
  };

  const handleDelete = async (pet) => {
    if (!window.confirm('Удалить объявление?')) return;

    try {
      await api.post(`/admin/pets/${pet.id}/delete/`);
      toast.success('Объявление удалено (деактивировано)');
      setPets(pets.filter(p => p.id !== pet.id));
    } catch (err) {
      toast.error('Ошибка при удалении');
    }
  };

  if (loading) return <p>Загрузка объявлений...</p>;

  return (
    <div className="admin-ads-page max-w-6xl mx-auto p-4">
      <h1>Модерация объявлений</h1>
      <div className="admin-ads-grid">
        {pets.map(pet => (
          <div key={pet.id} className="admin-ad-card">
            <PetCard pet={pet} />
            <div className="admin-ad-actions">
              {!pet.is_approved && (
                <button onClick={() => handleApprove(pet)} className="btn btn-success">
                  Одобрить
                </button>
              )}
              <button onClick={() => handleHide(pet)} className="btn btn-warning">
                {pet.is_hidden ? 'Показать' : 'Скрыть'}
              </button>
              <button onClick={() => handleDelete(pet)} className="btn btn-danger">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAds;