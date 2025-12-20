// frontend/src/pages/PetDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Lightbox from '../components/Lightbox';
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

  // ✅ Правильно: только pet.images
  const images = pet.images || [];

  return (
    <div className="pet-detail max-w-4xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        ← Назад к объявлениям
      </button>

      <div className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {images.length > 0 ? (
              <div
                className="w-full h-80 overflow-hidden rounded cursor-pointer"
                onClick={() => openLightbox(images[0].image)}
              >
                <img
                  src={images[0].image}
                  alt={pet.name || 'Питомец'}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                />
              </div>
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-80 flex items-center justify-center">
                <span>🖼️ Нет фото</span>
              </div>
            )}

            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.slice(1).map((img, idx) => (
                  <div
                    key={idx}
                    className="cursor-pointer overflow-hidden rounded"
                    onClick={() => openLightbox(img.image)}
                  >
                    <img
                      src={img.image}
                      alt={`Фото ${idx + 1}`}
                      className="w-full h-20 object-cover"
                      onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                    />
                  </div>
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
            <p className="text-lg font-semibold mb-2">{formatPrice(pet.price)}</p>
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
                  onClick={handleSendMessage}
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
                to={`/profile/${typeof pet.user === 'object' ? pet.user.id : pet.user}`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Профиль продавца
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