// frontend/src/pages/MyPets.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import PetCard from "../components/PetCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../styles/MyPets.css";

function MyPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchMyPets();
    fetchStats();
  }, []);

  const fetchMyPets = async () => {
    try {
      const response = await api.get("/pets/my_pets/");
      setPets(response.data.results || response.data);
    } catch {
      toast.error("Ошибка при загрузке объявлений");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/profile/stats/");
      setStats(response.data);
    } catch {
      console.error("Error fetching stats");
    }
  };

  const deletePet = async (id) => {
    if (!window.confirm("Удалить это объявление?")) return;
    try {
      await api.delete(`/pets/${id}/`);
      setPets((prev) => prev.filter((p) => p.id !== id));
      toast.success("Объявление удалено");
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  return (
    <div className="mypets-container">
      <div className="mypets-header">
        <h1>📋 Мои объявления</h1>
        <Link to="/create" className="btn btn-primary">
          ➕ Новое объявление
        </Link>
      </div>

      {stats && (
        <div className="stats-cards">
          <div className="stat">
            <span>📦 {stats.total_pets}</span>
            <p>Всего объявлений</p>
          </div>
          <div className="stat">
            <span>👁️ {stats.total_views}</span>
            <p>Просмотров</p>
          </div>
          <div className="stat">
            <span>✅ {stats.active_pets}</span>
            <p>Активных</p>
          </div>
          <div className="stat">
            <span>💰 {Math.round(stats.avg_price)} ₽</span>
            <p>Средняя цена</p>
          </div>
        </div>
      )}

      <div className="mypets-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pet-skeleton">
              <Skeleton height={200} />
              <Skeleton count={3} />
            </div>
          ))
        ) : pets.length ? (
          pets.map((pet) => (
            <div key={pet.id} className="mypet-card">
              <PetCard pet={pet} />
              <div className="mypet-actions">
                <Link to={`/pets/${pet.id}`} className="btn btn-secondary">
                  👁️ Смотреть
                </Link>
                <button
                  onClick={() => deletePet(pet.id)}
                  className="btn btn-danger"
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🐾</div>
            <h3>У вас пока нет объявлений</h3>
            <p>Создайте первое прямо сейчас</p>
            <Link to="/create" className="btn btn-primary">
              ➕ Создать
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPets;
