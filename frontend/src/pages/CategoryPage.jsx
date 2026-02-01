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
  }, [id, searchParams]); // ← реагируем на изменения URL

  const loadMore = () => {
    if (hasMore) {
      fetchPets(page + 1);
    }
  };

  const title = SPECIES_LABELS[id] || 'Животные';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Назад
      </button>

      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      <div className="ads-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <p className="text-gray-500 col-span-full text-center py-8">Объявлений нет</p>
        )}
      </div>

      {hasMore && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Показать ещё
          </button>
        </div>
      )}
    </div>
  );
}