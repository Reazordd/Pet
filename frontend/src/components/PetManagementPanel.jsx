// PetManagementPanel.jsx (обновлённая версия — только 2 строки изменены)
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

  const canRaise = pet.can_be_raised;

  return (
    <div className="pet-management bg-white rounded-xl p-5 shadow-sm border border-gray-100 mt-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Управление объявлением
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleRaise}
          disabled={loading || !canRaise}
          className={`px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            canRaise
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {canRaise ? 'Поднять объявление' : 'Поднять можно позже'}
        </button>

        <button
          onClick={handleToggleActive}
          disabled={loading}
          className={`px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            pet.is_active
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-md hover:shadow-lg'
              : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 shadow-md hover:shadow-lg'
          }`}
        >
          {pet.is_active ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Снять с публикации
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Вернуть в публикацию
            </>
          )}
        </button>
      </div>

      {pet.last_raised_at && (
        <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-6 8a2 2 0 11-4 0 2 2 0 014 0zM12 4.333v3.333m0 0h.01M12 7.667v3.333m0 0h.01M12 11v3.333m0 0h.01M12 14.333v3.333m0 0h.01M12 17.667v3.333m0 0h.01M12 21v-3.333m0 0h.01M12 17.667v-3.333m0 0h.01M12 14.333v-3.333m0 0h.01M12 11v-3.333m0 0h.01M12 7.667v-3.333m0 0h.01" />
          </svg>
          Последнее поднятие: {new Date(pet.last_raised_at).toLocaleDateString('ru-RU')}
        </p>
      )}
      {!pet.can_be_raised && pet.next_raise_allowed_at && (
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Следующее поднятие: {new Date(pet.next_raise_allowed_at).toLocaleDateString('ru-RU')}
        </p>
      )}
    </div>
  );
}