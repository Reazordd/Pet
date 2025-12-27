// frontend/src/pages/PetDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Lightbox from '../components/Lightbox';
import { buildImageUrl } from '../utils/image';
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
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(Number(decoded.user_id));
      } catch (e) {
        console.warn("Invalid token");
      }
    }
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

    let sellerId = pet.user?.id || pet.user;
    if (!sellerId) {
      toast.error('Невозможно определить продавца');
      return;
    }

    if (currentUserId === sellerId) {
      toast.warn('Нельзя написать самому себе');
      return;
    }

    try {
      const res = await api.post('/chat/create/', {
        target_user_id: sellerId
      });
      const chatId = res.data.id;
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Ошибка отправки:', err);
      const errorMsg = err.response?.data?.error || 'Не удалось начать чат';
      toast.error(errorMsg);
    }
  };

  // Управление объявлением (поднятие/снятие)
  const handleRaise = async () => {
    try {
      await api.post(`/pets/${id}/raise_ad/`);
      toast.success('✅ Объявление поднято!');
      fetchPet();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Не удалось поднять';
      toast.error(errorMsg);
    }
  };

  const handleToggleActive = async () => {
    try {
      if (pet.is_active) {
        await api.post(`/pets/${id}/deactivate/`);
        toast.info('Объявление снято с публикации');
      } else {
        await api.post(`/pets/${id}/activate/`);
        toast.success('Объявление снова в публикации');
      }
      fetchPet();
    } catch (err) {
      toast.error('Ошибка при изменении статуса');
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
  const isOwner = currentUserId && pet.user && (pet.user.id === currentUserId || pet.user === currentUserId);

  return (
    <div className="pet-detail max-w-4xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline font-medium">
        ← Назад к объявлениям
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Фото */}
          <div className="md:w-1/2 p-6">
            {images.length > 0 ? (
              <div
                className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(buildImageUrl(images[0].image))}
              >
                <img
                  src={buildImageUrl(images[0].image)}
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
                      src={buildImageUrl(img.image)}
                      alt={`Фото ${idx + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Текст */}
          <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-200">
            <h1 className="text-2xl font-bold mb-1">
              {pet.name || 'Без имени'} — {SPECIES_LABELS[pet.species]}
            </h1>
            {pet.breed && <p className="text-gray-600 mb-1">Порода: {pet.breed}</p>}
            {pet.age !== null && <p className="text-gray-700">Возраст: {pet.age} лет</p>}

            {/* ✅ КОМПАКТНАЯ КНОПКА ИЗБРАННОГО */}
            <div className="flex items-center justify-between my-2">
              <p className="text-xl font-semibold">{formatPrice(pet.price)}</p>
              <button
                onClick={toggleFavorite}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
              >
                {isFavorite ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 12.293a1 1 0 011.414 0L10 15.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-gray-700 mb-2">📍 {pet.city}</p>
            <div className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mb-4">
              {OFFER_LABELS[pet.offer_type]}
            </div>
            {pet.description && <p className="mt-2 text-gray-800 whitespace-pre-line">{pet.description}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              {pet.offer_type !== 'search' && (
                <button
                  onClick={handleSendMessage}
                  className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  💬 Написать
                </button>
              )}

              <Link
                to={`/profile/${typeof pet.user === 'object' ? pet.user.id : pet.user}`}
                className="flex-1 min-w-[120px] px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium text-center"
              >
                👤 Профиль
              </Link>

              {isOwner && (
                <Link
                  to={`/pets/${pet.id}/edit`}
                  className="flex-1 min-w-[120px] px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-center"
                >
                  ✏️ Редактировать
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Панель управления для владельца */}
      {isOwner && (
        <div className="pet-management bg-blue-50 p-4 rounded-lg mt-6">
          <h3 className="font-bold text-lg mb-3">Управление объявлением</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleRaise}
              disabled={!pet.can_be_raised}
              className={`px-4 py-2 rounded font-medium ${
                pet.can_be_raised
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {pet.can_be_raised ? 'Поднять объявление' : 'Поднять можно позже'}
            </button>

            <button
              onClick={handleToggleActive}
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
            <p className="text-sm text-gray-700 mt-2">
              Последнее поднятие: {new Date(pet.last_raised_at).toLocaleDateString('ru-RU')}
            </p>
          )}
          {!pet.can_be_raised && pet.next_raise_allowed_at && (
            <p className="text-sm text-gray-600 mt-1">
              Следующее поднятие: {new Date(pet.next_raise_allowed_at).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>
      )}

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