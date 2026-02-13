// frontend/src/pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SPECIES_LABELS = {
  dog: 'Собаки',
  cat: 'Кошки',
  bird: 'Птицы',
  rodent: 'Грызуны',
  fish: 'Рыбы',
  reptile: 'Рептилии',
  other: 'Другое',
};

export default function CategoryPage() {
  const { id } = useParams(); // id = 'dog', 'cat' и т.д.
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPets = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      const params = new URLSearchParams({
        species: id,
        page: pageNum,
        page_size: 12,
        ordering: '-created_at',
      });

      // Добавляем остальные фильтры из URL
      const q = searchParams.get('q');
      const city = searchParams.get('city');
      const breed = searchParams.get('breed');
      const age_group = searchParams.get('age_group');
      const min_price = searchParams.get('min_price');
      const max_price = searchParams.get('max_price');

      if (q) params.append('search', q);
      if (city) params.append('city', city);
      if (breed) params.append('breed', breed);
      if (age_group) params.append('age_group', age_group);
      if (min_price) params.append('min_price', min_price);
      if (max_price) params.append('max_price', max_price);

      const response = await api.get(`/pets/?${params.toString()}`);
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
    if (id) {
      fetchPets(1);
    }
  }, [id, searchParams]);

  const loadMore = () => {
    if (hasMore) {
      fetchPets(page + 1);
    }
  };

  const title = SPECIES_LABELS[id] || 'Животные';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Кнопка "Назад" — стилизована */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 btn btn-outline flex items-center"
        aria-label="Вернуться назад"
      >
        ← Назад
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>

      {/* Обёртка с фоном как на главной странице */}
      <div className="ads-section">
        <div className="ads-grid">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="pet-card">
                <Skeleton height={200} />
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