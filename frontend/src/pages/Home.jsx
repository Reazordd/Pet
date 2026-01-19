// frontend/src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import SearchFilters from '../components/SearchFilters';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../styles/Home.css';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 🔥 Получаем город пользователя
  const fetchUserLocation = async () => {
    try {
      const res = await api.get("/auth/profile/me/");
      return res.data.location || null;
    } catch {
      return null;
    }
  };

  const initFilters = () => {
    return {
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      species: searchParams.get('species') || '',
      breed: searchParams.get('breed') || '',
      age_group: searchParams.get('age_group') || '',
      minPrice: searchParams.get('min_price') || '',
      maxPrice: searchParams.get('max_price') || '',
    };
  };

  const fetchData = useCallback(async (pageNum = 1, currentFilters = {}) => {
    try {
      const loadingSetter = pageNum === 1 ? setLoading : setFilterLoading;
      loadingSetter(true);

      const params = new URLSearchParams({
        page: pageNum,
        page_size: 12,
      });

      // Если нет фильтра по городу — используем город пользователя
      let cityFilter = currentFilters.city || '';
      if (!cityFilter && !currentFilters.search) {
        const userLocation = await fetchUserLocation();
        if (userLocation) {
          cityFilter = userLocation;
        }
      }

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== '') {
          const paramName = key === 'minPrice' ? 'min_price' : key === 'maxPrice' ? 'max_price' : key;
          params.append(paramName, value);
        }
      });

      if (cityFilter) {
        params.append('city', cityFilter);
      }

      const response = await api.get(`/pets/?${params.toString()}`);
      const newPets = response.data.results || [];

      setPets(prev => pageNum === 1 ? newPets : [...prev, ...newPets]);
      setHasMore(!!response.data.next);
      setPage(pageNum);
    } catch (err) {
      console.error('Ошибка загрузки объявлений:', err);
      toast.error('Ошибка при загрузке объявлений');
      setHasMore(false);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
      toast.error('Ошибка при загрузке категорий');
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    const initialFilters = initFilters();
    setFilters(initialFilters);
    fetchData(1, initialFilters);
    fetchCategories();
  }, [fetchData, fetchCategories]);

  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        const paramName = key === 'minPrice' ? 'min_price' : key === 'maxPrice' ? 'max_price' : key;
        params.set(paramName, value);
      }
    });
    setSearchParams(params, { replace: true });
    fetchData(1, newFilters);
  }, [fetchData, setSearchParams]);

  const loadMore = () => {
    if (!filterLoading && hasMore) {
      fetchData(page + 1, filters);
    }
  };

  return (
    <div className="home-wrapper">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Купите или найдите питомца вашей мечты 🐶🐱</h1>
          <p>Тысячи объявлений о животных по всей России. Удобный поиск, честные продавцы, безопасные сделки.</p>
          <div className="hero-buttons">
            <Link to="/create" className="btn btn-primary">Разместить объявление</Link>
            <Link to="/" className="btn btn-outline">Посмотреть все</Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="filters-section mb-6">
        <SearchFilters onFilter={handleFilter} loading={filterLoading} />
      </div>

      {/* Categories */}
      <section className="categories-section">
        <h2>Популярные категории</h2>
        <div className="categories-grid">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}  // ← ИЗМЕНЕНО: теперь /category/dog
              className="category-card"
            >
              <div className="category-icon">{cat.icon || '🐾'}</div>
              <div className="category-name">{cat.name}</div>
              <div className="category-count">{cat.pet_count || 0} объявлений</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Ads */}
      <section className="ads-section">
        <div className="ads-header">
          <h2>Объявления рядом с вами</h2>
          <span className="ads-count">{pets.length} найдено</span>
        </div>

        <div className="ads-grid">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="pet-card">
                <Skeleton height={200} />
                <Skeleton count={3} />
              </div>
            ))
          ) : pets.length > 0 ? (
            pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
          ) : (
            <div className="no-results">
              <h3>😿 Объявлений не найдено</h3>
              <p>Попробуйте изменить фильтры или категорию.</p>
            </div>
          )}
        </div>

        {hasMore && !loading && (
          <div className="load-more">
            <button onClick={loadMore} disabled={filterLoading}>
              {filterLoading ? 'Загрузка...' : 'Показать ещё'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;