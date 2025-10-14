import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import PetCard from "../components/PetCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../styles/SellerProfile.css";

function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const [userRes, petsRes] = await Promise.all([
        api.get(`/users/${id}/`),
        api.get(`/pets/?user=${id}`),
      ]);
      setSeller(userRes.data);
      setPets(petsRes.data.results || petsRes.data);
    } catch (error) {
      toast.error("Не удалось загрузить профиль продавца");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-page">
        <div className="seller-header">
          <Skeleton circle width={120} height={120} />
          <div className="seller-info">
            <Skeleton height={30} width={200} />
            <Skeleton count={2} width={150} />
          </div>
        </div>
        <div className="pets-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pet-card">
              <Skeleton height={200} />
              <Skeleton count={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="seller-page">
        <div className="empty-state">
          <h2>Продавец не найден</h2>
          <Link to="/" className="btn btn-primary">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-page">
      {/* Информация о продавце */}
      <div className="seller-header">
        <div className="seller-avatar">
          {seller.avatar ? (
            <img src={seller.avatar} alt={seller.username} />
          ) : (
            <div className="avatar-placeholder">
              {seller.username[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="seller-info">
          <h1>{seller.first_name || seller.username}</h1>
          <p className="seller-email">📧 {seller.email}</p>
          {seller.phone && <p className="seller-phone">📞 {seller.phone}</p>}
          {seller.address && <p className="seller-address">📍 {seller.address}</p>}
        </div>
      </div>

      <div className="seller-divider" />

      {/* Список объявлений продавца */}
      <div className="seller-pets-section">
        <h2>Объявления продавца</h2>

        {pets.length > 0 ? (
          <div className="pets-grid">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>😿 У этого продавца пока нет объявлений</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProfile;
