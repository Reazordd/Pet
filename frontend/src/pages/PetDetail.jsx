// frontend/src/pages/PetDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Lightbox from '../components/Lightbox';
import ViewStatsChart from '../components/ViewStatsChart';
import { buildImageUrl } from '../utils/image';
import { jwtDecode } from 'jwt-decode';
import '../styles/PetDetail.css';

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
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  useEffect(() => {
    if (pet && currentUserId) {
      api.post(`/history/add/${id}/`).catch(err => console.warn('History error:', err));
    }
  }, [pet, currentUserId, id]);

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
        target_user_id: sellerId,
        pet_id: pet.id
      });
      const chatId = res.data.id;
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Ошибка отправки:', err.response?.data?.error || 'Не удалось начать чат');
      toast.error('Не удалось начать чат');
    }
  };

  const handleReport = () => {
    const reason = prompt('Укажите причину жалобы (например: "спам", "мошенничество", "неприемлемый контент"):');
    if (reason && reason.trim()) {
      api.post(`/pets/${id}/report/`, { reason: reason.trim() })
        .then(() => toast.success('Жалоба отправлена на модерацию'))
        .catch(err => {
          console.error(err);
          toast.error('Не удалось отправить жалобу');
        });
    }
  };

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

  const handleDeactivate = async () => {
    try {
      await api.post(`/pets/${id}/deactivate/`);
      setPet(prev => ({ ...prev, is_active: false }));
      toast.info('Объявление снято с публикации');
    } catch (err) {
      toast.error('Ошибка при снятии с публикации');
    }
  };

  const handleActivate = async () => {
    try {
      await api.post(`/pets/${id}/activate/`);
      setPet(prev => ({ ...prev, is_active: true }));
      toast.success('Объявление снова в публикации');
    } catch (err) {
      toast.error('Ошибка при возврате в публикацию');
    }
  };

  const openLightbox = (src) => {
    if (!pet || !pet.images) return;
    const imageUrls = pet.images.map(img => buildImageUrl(img.image));
    const index = imageUrls.indexOf(src);
    if (index === -1) return;
    setAllImages(imageUrls);
    setCurrentImageIndex(index);
    setLightboxImage(src);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setAllImages([]);
    setCurrentImageIndex(0);
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

  const getPetName = () => {
    return pet.name || pet.breed || 'Питомец';
  };

  return (
    <div className="pet-detail">
      <Link to="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="pet-detail-back">
        ← Назад к объявлениям
      </Link>

      <div className="pet-detail-card">
        {/* Левая часть: изображения */}
        <div className="pet-detail-image-section">
          {images.length > 0 ? (
            <div
              onClick={() => openLightbox(buildImageUrl(images[0].image))}
              className="pet-detail-main-image-container"
            >
              {/* 🔥 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: внутренняя обёртка */}
              <div className="pet-detail-image-wrapper">
                <img
                  src={buildImageUrl(images[0].image)}
                  alt={getPetName()}
                  className="pet-detail-main-image"
                  onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                />
              </div>
            </div>
          ) : (
            <div className="pet-detail-main-image-container">
              <span className="pet-detail-placeholder">🖼️ Нет фото</span>
            </div>
          )}

          {images.length > 1 && (
            <div className="pet-detail-thumbnails">
              {images.slice(1, 6).map((img, idx) => (
                <div
                  key={'thumb-' + idx}
                  className="pet-detail-thumbnail"
                  onClick={() => openLightbox(buildImageUrl(img.image))}
                >
                  <img
                    src={buildImageUrl(img.image)}
                    alt={`Фото ${idx + 2}`}
                    onError={(e) => (e.target.src = '/images/placeholder-pet.jpg')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Правая часть: информация */}
        <div className="pet-detail-info-section">
          <h1 className="pet-detail-title">
            {getPetName()}
          </h1>
          <div className="pet-detail-species-badge">
            {SPECIES_LABELS[pet.species]}
          </div>

          {pet.breed && <p className="pet-detail-breed">Порода: {pet.breed}</p>}
          {pet.birth_date && (
            <p className="pet-detail-birth-date">
              Дата рождения: {new Date(pet.birth_date).toLocaleDateString('ru-RU')}
            </p>
          )}

          <div className="pet-detail-price-container">
            <p className="pet-detail-price">{formatPrice(pet.price)}</p>
            <button
              onClick={toggleFavorite}
              className={`pet-detail-favorite-btn ${isFavorite ? 'active' : ''}`}
              aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <p className="pet-detail-location">📍 {pet.city}</p>

          <div className="pet-detail-offer-type">
            {OFFER_LABELS[pet.offer_type]}
          </div>

          {pet.description && <p className="pet-detail-description">{pet.description}</p>}

          <div className="pet-detail-actions">
            {pet.offer_type !== 'search' && (
              <>
                <button
                  onClick={handleReport}
                  className="pet-detail-action-btn btn-report"
                >
                  🚩 Пожаловаться
                </button>
                <button
                  onClick={handleSendMessage}
                  className="pet-detail-action-btn btn-message"
                >
                  💬 Написать
                </button>
              </>
            )}

            <Link
              to={`/profile/${typeof pet.user === 'object' ? pet.user.id : pet.user}`}
              className="pet-detail-action-btn btn-profile"
            >
              👤 Профиль
            </Link>

            {isOwner && (
              <Link
                to={`/pets/${pet.id}/edit`}
                className="pet-detail-action-btn btn-edit"
              >
                ✏️ Редактировать
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Управление объявлением (только для владельца) */}
      {isOwner && (
        <div className="pet-management">
          <h3>Управление объявлением</h3>
          <div className="pet-management-grid">
            <button
              onClick={handleRaise}
              disabled={!pet.can_be_raised}
              className={`pet-detail-action-btn ${pet.can_be_raised ? 'btn-message' : 'btn-profile'}`}
            >
              {pet.can_be_raised ? 'Поднять объявление' : 'Поднять можно позже'}
            </button>

            {pet.is_active ? (
              <button
                onClick={handleDeactivate}
                className="pet-detail-action-btn btn-report"
              >
                Снять с публикации
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="pet-detail-action-btn btn-message"
              >
                Вернуть в публикацию
              </button>
            )}
          </div>

          {pet.last_raised_at && (
            <p className="pet-detail-birth-date">
              Последнее поднятие: {new Date(pet.last_raised_at).toLocaleDateString('ru-RU')}
            </p>
          )}
          {!pet.can_be_raised && pet.next_raise_allowed_at && (
            <p className="pet-detail-birth-date">
              Следующее поднятие: {new Date(pet.next_raise_allowed_at).toLocaleDateString('ru-RU')}
            </p>
          )}

          <ViewStatsChart petId={pet.id} />
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox
          src={lightboxImage}
          alt="Фото питомца"
          onClose={closeLightbox}
          images={allImages}
          currentIndex={currentImageIndex}
        />
      )}

      {/* Похожие объявления */}
      {similarPets.length > 0 && (
        <div className="pet-detail-similar">
          <h2>Похожие объявления</h2>
          <div className="pets-grid">
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