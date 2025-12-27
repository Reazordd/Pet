// PetManagementPanel.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function PetManagementPanel({ pet, onAction }) {
  const [loading, setLoading] = useState(false);

  const handleRaise = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.post(`/pets/${pet.id}/raise_ad/`);
      toast.success('✅ Объявление поднято!');
      onAction('raised');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Не удалось поднять объявление';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (pet.is_active) {
        await api.post(`/pets/${pet.id}/deactivate/`);
        toast.info('Объявление снято с публикации');
      } else {
        await api.post(`/pets/${pet.id}/activate/`);
        toast.success('Объявление снова в публикации');
      }
      onAction('toggled');
    } catch (err) {
      toast.error('Ошибка при изменении статуса');
    } finally {
      setLoading(false);
    }
  };

  // Проверка возможности поднять
  const canRaise = pet.can_be_raised; // ← приходит с бэка

  return (
    <div className="pet-management bg-blue-50 p-4 rounded-lg mt-4">
      <h3 className="font-bold mb-3">Управление объявлением</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleRaise}
          disabled={loading || !canRaise}
          className={`px-4 py-2 rounded font-medium ${
            canRaise
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canRaise ? 'Поднять объявление' : 'Поднять можно 7 декабря'}
        </button>

        <button
          onClick={handleToggleActive}
          disabled={loading}
          className={`px-4 py-2 rounded font-medium ${
            pet.is_active
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          {pet.is_active ? 'Снять с публикации' : 'Вернуть в публикацию'}
        </button>
      </div>

      {pet.last_raised_at && (
        <p className="text-sm text-gray-600 mt-2">
          Последнее поднятие: {new Date(pet.last_raised_at).toLocaleDateString('ru-RU')}
        </p>
      )}
    </div>
  );
}