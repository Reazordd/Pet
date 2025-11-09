// frontend/src/pages/PetDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import ChatButton from "../components/ChatButton";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../styles/PetDetail.css";

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  const isFavorite = favorites.some((f) => f.id === parseInt(id));

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const res = await api.get(`/pets/${id}/`);
      setPet(res.data);
      await api.post(`/pets/${id}/increment_views/`).catch(() => {});
    } catch {
      toast.error("Объявление не найдено");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    let updated;
    if (isFavorite) {
      updated = favorites.filter((f) => f.id !== parseInt(id));
      toast.info("Удалено из избранного");
    } else {
      updated = [...favorites, pet];
      toast.success("Добавлено в избранное ❤️");
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (loading)
    return (
      <div className="pet-detail">
        <Skeleton height={400} />
      </div>
    );

  return (
    <div className="pet-detail">
      <div className="pet-detail-content">
        <div className="pet-image">
          {pet.photo ? (
            <img src={pet.photo} alt={pet.name} />
          ) : (
            <div className="no-photo">🐾</div>
          )}
          <button
            onClick={toggleFavorite}
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>

        <div className="pet-info">
          <h1>{pet.name}</h1>
          <p className="pet-price">
            {pet.price
              ? `${pet.price.toLocaleString("ru-RU")} ₽`
              : "Цена не указана"}
          </p>
          <p>{pet.description}</p>

          {pet.category?.name && <p>Категория: {pet.category.name}</p>}

          <p>
            Продавец:{" "}
            <Link to={`/seller/${pet.user.id}`}>{pet.user.username}</Link>
          </p>

          <div className="pet-actions">
            <ChatButton otherUserId={pet.user.id} />
            <button onClick={toggleFavorite} className="btn btn-secondary">
              {isFavorite ? "💔 Удалить из избранного" : "❤️ В избранное"}
            </button>
            <button onClick={() => toast.info("Связь с продавцом")} className="btn btn-primary">
              📞 Связаться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetDetail;
