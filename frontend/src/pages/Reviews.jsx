// frontend/src/pages/Reviews.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import { buildImageUrl } from "../utils/image";
import "../styles/Reviews.css";

function Reviews() {
  const { id } = useParams(); // seller ID
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    avg_rating: 0,
    total_reviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");

  useEffect(() => {
    fetchReviews();
    fetchSellerPets();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/user/${id}/reviews/`);
      setReviews(res.data.reviews || []);
      setRatingStats(res.data.rating_stats || {
        avg_rating: 0,
        total_reviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    } catch (err) {
      console.error("Fetch reviews error:", err);
      toast.error("Не удалось загрузить отзывы");
    }
  };

  const fetchSellerPets = async () => {
    try {
      const res = await api.get(`/pets/?user=${id}&page_size=100`);
      setPets(res.data.results || []);
      if (res.data.results?.length > 0) {
        setSelectedPetId(String(res.data.results[0].id));
      }
    } catch (err) {
      console.warn("Не удалось загрузить объявления продавца");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Поставьте оценку");
      return;
    }
    try {
      const data = {
        rating,
        comment
      };
      if (selectedPetId) {
        data.pet_id = Number(selectedPetId);
      }
      await api.post(`/reviews/user/${id}/review/`, data);
      toast.success("Отзыв добавлен!");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      console.error("Create review error:", err.response?.data);
      toast.error(err.response?.data?.error || "Ошибка при добавлении отзыва");
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="reviews-page">
      <h1>Отзывы и оценки</h1>

      {/* Статистика как у Avito */}
      <div className="rating-summary">
        <div className="avg-rating">{ratingStats.avg_rating.toFixed(1)}</div>
        <div className="rating-text">
          на основании {ratingStats.total_reviews} {ratingStats.total_reviews === 1 ? 'оценки' : 'оценок'}
        </div>

        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="rating-bar">
              <span className="star-count">{stars}</span>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${ratingStats.total_reviews ? (ratingStats.distribution[stars] / ratingStats.total_reviews) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="review-count">{ratingStats.distribution[stars]}</span>
            </div>
          ))}
        </div>
        <p className="rating-info">Рейтинг — это среднее арифметическое оценок пользователей.</p>
      </div>

      <h2>Опубликованные отзывы ({ratingStats.total_reviews})</h2>
      <p className="reviews-info">Отзывы, которые влияют на ваш рейтинг.</p>

      {/* Форма отзыва */}
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-group">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={`star ${rating >= num ? "active" : ""}`}
              onClick={() => setRating(num)}
            >
              ★
            </span>
          ))}
        </div>

        {pets.length > 0 && (
          <div className="form-group mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Выберите объявление:
            </label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Не привязывать к объявлению</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name || 'Без названия'} — {pet.price ? `${pet.price} ₽` : 'Договорная'}
                </option>
              ))}
            </select>
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Напишите свой отзыв..."
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <button type="submit" className="btn btn-primary w-full mt-2">
          Оставить отзыв
        </button>
      </form>

      {/* Список отзывов */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>Пока нет отзывов 😔</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="review-item">
              <div className="review-header">
                <span className="review-user">
                  {rev.reviewer?.username || "Аноним"}
                </span>
                <span className="review-stars">
                  {renderStars(rev.rating)}
                </span>
              </div>
              {rev.pet && (
                <div className="review-pet">
                  <span>Сделка состоялась · </span>
                  <span>{rev.pet.name || rev.pet.title}</span>
                  {rev.pet.images?.[0] && (
                    <img
                      src={buildImageUrl(rev.pet.images[0].image)}
                      alt="Объявление"
                      className="review-pet-image"
                    />
                  )}
                </div>
              )}
              <p className="review-text">{rev.comment}</p>
              <span className="review-date">
                {new Date(rev.created_at).toLocaleDateString("ru-RU", {
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reviews;