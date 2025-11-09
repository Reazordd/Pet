// frontend/src/pages/SellerProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import PetCard from "../components/PetCard";
import { toast } from "react-toastify";
import "../styles/SellerProfile.css";

function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    if (id) loadSeller();
  }, [id]);

  const loadSeller = async () => {
    try {
      const [u, p] = await Promise.all([api.get(`/users/${id}/`), api.get(`/pets/?user=${id}`)]);
      setSeller(u.data);
      setPets(p.data.results || p.data);
    } catch {
      toast.error("Ошибка при загрузке продавца");
    }
  };

  if (!seller)
    return (
      <div className="seller-profile">
        <h2>Продавец не найден</h2>
        <Link to="/">На главную</Link>
      </div>
    );

  return (
    <div className="seller-profile">
      <div className="seller-header">
        <div className="avatar">{seller.avatar ? <img src={seller.avatar} alt={seller.username} /> : "👤"}</div>
        <div className="info">
          <h1>{seller.username}</h1>
          <p>{seller.first_name} {seller.last_name}</p>
          {seller.location && <p>📍 {seller.location}</p>}
          {seller.bio && <p>📝 {seller.bio}</p>}
        </div>
      </div>

      <h2>Объявления</h2>
      <div className="pets-grid">
        {pets.length > 0 ? pets.map((p) => <PetCard key={p.id} pet={p} />) : <p>Нет активных объявлений</p>}
      </div>
    </div>
  );
}

export default SellerProfile;
