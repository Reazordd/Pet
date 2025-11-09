// frontend/src/pages/Reviews.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import "../styles/Reviews.css";

function Reviews() {
  const { id } = useParams(); // seller ID
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/users/${id}/reviews/`);
      setReviews(res.data);
    } catch {
      toast.error("Не удалось загрузить отзывы");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/users/${id}/reviews/`, { rating, text });
      toast.success("Отзыв добавлен!");
      setRating(0);
      setText("");
      fetchReviews();
    } catch {
      toast.error("Ошибка при добавлении отзыва");
    }
  };

  return (
    <div className="reviews-page">
      <h1>Отзывы о продавце</h1>

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
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите свой отзыв..."
          required
        />
        <button type="submit" className="btn btn-primary">
          Оставить отзыв
        </button>
      </form>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>Пока нет отзывов 😔</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="review-item">
              <div className="review-header">
                <span className="review-user">
                  {rev.user?.username || "Аноним"}
                </span>
                <span className="review-stars">
                  {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </span>
              </div>
              <p className="review-text">{rev.text}</p>
              <span className="review-date">
                {new Date(rev.created_at).toLocaleDateString("ru-RU")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reviews;
