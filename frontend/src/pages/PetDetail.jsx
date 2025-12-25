// frontend/src/pages/PetDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Lightbox from '../components/Lightbox';
import { buildImageUrl } from '../utils/image'; // ← добавлено
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
  const [lightboxImage, setLightboxImage] = useState(null);

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
        await api.delete(`/pets/${id}/favorite/`);
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

  const handleSendMessage = async () => {
    if (!pet) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Войдите в аккаунт, чтобы написать продавцу');
      navigate('/login');
      return;
    }

    let sellerId;
    if (typeof pet.user === 'number') {
      sellerId = pet.user;
    } else if (typeof pet.user === 'object' && pet.user?.id) {
      sellerId = pet.user.id;
    }

    if (!sellerId) {
      toast.error('Невозможно определить продавца');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentUserId = Number(decoded.user_id);

      if (currentUserId === sellerId) {
        toast.warn('Нельзя написать самому себе');
        return;
      }

      const res = await api.post('/chat/create/', {
        target_user_id: sellerId
      });
      const chatId = res.data.id;
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Ошибка отправки:', err);
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Не удалось начать чат');
      }
    }
  };

  const openLightbox = (src) => {
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!pet) return null;

  const formatPrice = (price) => {
    if (price === null) return 'Договорная';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const images = pet.images || [];

  return (
    <div className="pet-detail max-w-4xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline font-medium">
        ← Назад к объявлениям
      </button>

      {/* ✅ Avito-стиль: одна строка — фото слева, текст справа */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Левая часть — фото */}
          <div className="md:w-1/2 p-6">
            {images.length > 0 ? (
              <div
                className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(buildImageUrl(images[0].image))}
              >
                <img
                  src={buildImageUrl(images[0].image)} // ← исправлено
                  alt={pet.name || 'Питомец'}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-2xl">🖼️ Нет фото</span>
              </div>
            )}

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {images.slice(1).map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full h-20 bg-gray-100 rounded overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(buildImageUrl(img.image))}
                  >
                    <img
                      src={buildImageUrl(img.image)} // ← исправлено
                      alt={`Фото ${idx + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Правая часть — текст */}
          <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-200">
            <h1 className="text-2xl font-bold mb-1">
              {pet.name || 'Без имени'} — {SPECIES_LABELS[pet.species]}
            </h1>
            {pet.breed && <p className="text-gray-600 mb-1">Порода: {pet.breed}</p>}
            {pet.age !== null && <p className="text-gray-700">Возраст: {pet.age} лет</p>}
            <p className="text-xl font-semibold my-2">{formatPrice(pet.price)}</p>
            <p className="text-gray-700 mb-2">📍 {pet.city}</p>
            <div className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mb-4">
              {OFFER_LABELS[pet.offer_type]}
            </div>
            {pet.description && <p className="mt-2 text-gray-800 whitespace-pre-line">{pet.description}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={toggleFavorite}
                className={`px-4 py-2 rounded-lg flex items-center font-medium ${
                  isFavorite
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                {isFavorite ? 'В избранном' : 'Добавить в избранное'}
              </button>

              {pet.offer_type !== 'search' && (
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
                >
                  💬 Написать
                </button>
              )}

              <Link
                to={`/profile/${typeof pet.user === 'object' ? pet.user.id : pet.user}`}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium"
              >
                👤 Профиль продавца
              </Link>
            </div>
          </div>
        </div>
      </div>

      {lightboxImage && (
        <Lightbox
          src={lightboxImage}
          alt="Фото питомца"
          onClose={closeLightbox}
        />
      )}

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