// frontend/src/pages/MyAdsTab.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import PetCard from "../components/PetCard";

function MyAdsTab({ stats }) {
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAds();
  }, []);

  const fetchMyAds = async () => {
    try {
      const res = await api.get("/pets/?owner=true");
      setMyAds(res.data.results || []);
    } catch (err) {
      console.error("Ошибка загрузки объявлений:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null) return "Договорная";
    return new Intl.NumberFormat('ru-RU').format(price) + " ₽";
  };

  if (loading) return <p>Загрузка объявлений...</p>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded text-center">
          <h3 className="font-bold text-lg">{stats.total_pets || 0}</h3>
          <p className="text-gray-600">Всего</p>
        </div>
        <div className="bg-green-50 p-4 rounded text-center">
          <h3 className="font-bold text-lg">{stats.active_pets || 0}</h3>
          <p className="text-gray-600">Активные</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded text-center">
          <h3 className="font-bold text-lg">{Math.round(stats.avg_price || 0)} ₽</h3>
          <p className="text-gray-600">Средняя цена</p>
        </div>
        <div className="bg-purple-50 p-4 rounded text-center">
          <h3 className="font-bold text-lg">{stats.total_reviews || 0}</h3>
          <p className="text-gray-600">Отзывов</p>
        </div>
      </div>

      {myAds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAds.map((ad) => (
            <div key={ad.id} className="border rounded p-4 hover:shadow-md">
              <img
                src={ad.image || "/images/placeholder-pet.jpg"}
                alt={ad.name || "Питомец"}
                className="w-full h-40 object-cover rounded mb-3"
                onError={(e) => (e.target.src = "/images/placeholder-pet.jpg")}
              />
              <h3 className="font-bold truncate">{ad.name || "Без имени"}</h3>
              <p className="price text-lg font-semibold">{formatPrice(ad.price)}</p>
              <p className="text-gray-600 truncate">{ad.city}</p>
              <p className={`mt-2 ${ad.is_active ? "text-green-600" : "text-red-600"}`}>
                {ad.is_active ? "Активно" : "Скрыто"}
              </p>
              <button
                onClick={() => navigate(`/pets/${ad.id}`)}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Редактировать
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">У вас пока нет объявлений.</p>
      )}
    </div>
  );
}

export default MyAdsTab;