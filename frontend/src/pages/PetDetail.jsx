import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import { checkToken } from "../utils/auth";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../styles/PetDetail.css";

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAuthenticated = checkToken();

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pets/${id}/`);
      setPet(response.data);
    } catch {
      setError("Объявление не найдено");
      toast.error("Не удалось загрузить объявление");
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.info("Войдите в систему, чтобы связаться с продавцом");
      navigate("/login");
      return;
    }

    if (pet.user_phone) {
      window.open(`tel:${pet.user_phone}`, "_blank");
    } else if (pet.user_email) {
      window.open(`mailto:${pet.user_email}`, "_blank");
    } else {
      toast.info("Контактная информация не указана");
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Цена не указана";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (error) {
    return (
      <div className="pet-detail-container">
        <div className="error-state">
          <h2>{error}</h2>
          <Link to="/" className="btn btn-primary">
            ← На главную
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !pet) {
    return (
      <div className="pet-detail-container">
        <div className="pet-detail-card">
          <div className="pet-image-skeleton">
            <Skeleton height={400} />
          </div>
          <div className="pet-info">
            <Skeleton height={40} width={200} />
            <Skeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-detail-container">
      <div className="pet-detail-card">
        {/* Фото питомца */}
        <div className="pet-image">
          {pet.photo ? (
            <img
              src={pet.photo}
              alt={pet.name}
              onError={(e) => (e.target.src = "/images/default-pet.jpg")}
            />
          ) : (
            <div className="no-image">
              <span>🐾</span>
              <p>Фото не добавлено</p>
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="pet-info">
          <h1 className="pet-title">{pet.name}</h1>

          <div className="pet-meta">
            <span>{pet.breed || "Не указано"}</span>
            <span>{pet.age || "Возраст не указан"}</span>
            {pet.category?.name && <span>{pet.category.name}</span>}
          </div>

          <div className="pet-price">{formatPrice(pet.price)}</div>

          <div className="pet-description">
            <h3>Описание</h3>
            <p>{pet.description || "Описание отсутствует"}</p>
          </div>

          <div className="pet-actions">
            <button onClick={handleContact} className="btn btn-primary">
              📞 Связаться с продавцом
            </button>

            {pet.user_phone && (
              <a href={`tel:${pet.user_phone}`} className="btn btn-secondary">
                📱 {pet.user_phone}
              </a>
            )}

            {pet.user_email && (
              <a href={`mailto:${pet.user_email}`} className="btn btn-secondary">
                ✉️ Написать продавцу
              </a>
            )}
          </div>

          <div className="pet-stats">
            <div>
              👁️ {pet.views_count || 0} просмотров
            </div>
            <div>
              📅 Размещено:{" "}
              {new Date(pet.created_at).toLocaleDateString("ru-RU")}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка "Назад" */}
      <div className="back-link">
        <Link to="/" className="btn btn-secondary">
          ← Вернуться к списку
        </Link>
      </div>
    </div>
  );
}

export default PetDetail;
