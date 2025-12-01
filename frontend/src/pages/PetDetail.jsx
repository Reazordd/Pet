// frontend/src/pages/PetDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import '../styles/PetDetail.css';
import { jwtDecode } from 'jwt-decode';

const SPECIES_LABELS = {
  dog: 'Собака',
  cat: 'Кошка',
  bird: 'Птица',
  rodent: 'Грызун',
  fish: 'Рыба',
  reptile: 'Рептилия',
  other: 'Другое',
};

const OFFER_LABELS = {
  sale: 'Продажа',
  giveaway: 'Отдам',
  search: 'Ищу',
};

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [similarPets, setSimilarPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const res = await api.get(`/pets/${id}/`);
      setPet(res.data);
      setIsFavorite(res.data.is_favorite || false);

      try {
        const similarRes = await api.get(`/pets/${id}/similar/`);
        setSimilarPets(similarRes.data);
      } catch (err) {
        console.warn('Similar pets not available:', err.message);
        setSimilarPets([]);
      }
    } catch (err) {
      console.error(err);
      setError('Объявление не найдено');
      toast.error('Объявление не найдено');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/pets/${id}/remove_favorite/`);
        setIsFavorite(false);
        toast.info('Удалено из избранного');
      } else {
        await api.post(`/pets/${id}/favorite/`);
        setIsFavorite(true);
        toast.success('Добавлено в избранное');
      }
    } catch (err) {
      toast.error('Ошибка при обновлении избранного');
    }
  };

  const handleChat = async () => {
    if (!pet) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Войдите в аккаунт, чтобы написать продавцу');
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentUserId = decoded.user_id;

      const res = await api.post('/chat/create/', {
        users: [pet.user.id, currentUserId]
      });
      const chatId = res.data.id;
      toast.success('Чат создан');
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Ошибка при создании чата:', err);
      toast.error('Не удалось создать чат');
    }
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!pet) return null;

  // 🔥 Исправлено: функция называется `formatPrice`, а не `formatPrice`
  const formatPrice = (price) => {
    if (price === null) return 'Договорная';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  return (
    <div className="pet-detail max-w-4xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        ← Назад к объявлениям
      </button>

      <div className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Галерея фото */}
          <div>
            {pet.images && pet.images.length > 0 ? (
              <img
                src={pet.image || pet.images[0]?.image || '/images/placeholder-pet.jpg'}
                alt={pet.name || 'Питомец'}
                className="w-full h-80 object-cover rounded"
                onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-80 flex items-center justify-center">
                <span>🖼️ Нет фото</span>
              </div>
            )}
            {pet.images && pet.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {pet.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image || '/images/placeholder-pet.jpg'}
                    alt={`Фото ${img.id}`}
                    className="h-20 object-cover rounded cursor-pointer"
                    onClick={() => setPet({...pet, image: img.image})}
                    onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">
              {pet.name || 'Без имени'} — {SPECIES_LABELS[pet.species]}
            </h1>
            {pet.breed && <p className="text-gray-600 mb-1">Порода: {pet.breed}</p>}
            {pet.age !== null && <p>Возраст: {pet.age} лет</p>}
            <p className="text-lg font-semibold mb-2">{formatPrice(pet.price)}</p>  {/* ✅ Правильно: formatPrice */}
            <p className="text-gray-700 mb-1">Город: {pet.city}</p>
            <p className="text-sm text-gray-500 mb-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {OFFER_LABELS[pet.offer_type]}
              </span>
            </p>
            {pet.description && <p className="mt-4 whitespace-pre-line">{pet.description}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={toggleFavorite}
                className={`px-4 py-2 rounded flex items-center ${
                  isFavorite
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.828a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                {isFavorite ? 'В избранном' : 'В избранное'}
              </button>

              {pet.offer_type !== 'search' && (
                <button
                  onClick={handleChat}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  Написать
                </button>
              )}

              <Link
                to={`/profile/${pet.user.id}`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Профиль продавца
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 Похожие объявления */}
      {similarPets.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Похожие объявления</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PetDetail;