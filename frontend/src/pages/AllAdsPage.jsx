// frontend/src/pages/AllAdsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function AllAdsPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAllPets = async (pageNum = 1) => {
    try {
      const response = await api.get(`/pets/?page=${pageNum}&page_size=12&ordering=-created_at`);
      const newPets = response.data.results || [];
      setPets(prev => pageNum === 1 ? newPets : [...prev, ...newPets]);
      setHasMore(!!response.data.next);
      setPage(pageNum);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      toast.error('Не удалось загрузить объявления');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPets(1);
  }, []);

  const loadMore = () => {
    if (hasMore) {
      fetchAllPets(page + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Кнопка "Назад" — стилизована как outline */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 btn btn-outline flex items-center"
        aria-label="Вернуться назад"
      >
        ← Назад
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">Все объявления</h1>

      {/* Обёртка с фоном как на главной — panel-faint */}
      <div className="ads-section">
        <div className="ads-grid">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="pet-card">
                <Skeleton height={140} />
                <Skeleton count={3} />
              </div>
            ))
          ) : pets.length > 0 ? (
            pets.map(pet => <PetCard key={pet.id} pet={pet} />)
          ) : (
            <p className="text-gray-500 col-span-full text-center py-12">Объявлений нет</p>
          )}
        </div>
      </div>

      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="btn btn-primary px-6 py-3 font-medium"
          >
            Показать ещё
          </button>
        </div>
      )}
    </div>
  );
}