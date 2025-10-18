import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import SearchFilters from '../components/SearchFilters';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../styles/Home.css';

function Home() {
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async (pageNum = 1, currentFilters = {}) => {
    try {
      const loadingType = pageNum === 1 ? setLoading : setFilterLoading;
      loadingType(true);

      const params = new URLSearchParams({
        page: pageNum,
        page_size: 12,
        ...currentFilters,
      });

      Object.keys(currentFilters).forEach((key) => {
        if (!currentFilters[key]) params.delete(key);
      });

      const response = await api.get(`/pets/?${params}`);
      const newPets = response.data.results || response.data;

      setPets(pageNum === 1 ? newPets : [...pets, ...newPets]);
      setHasMore(newPets.length === 12);
      setPage(pageNum);
    } catch {
      toast.error('Ошибка при загрузке объявлений');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data.results || response.data);
    } catch {
      toast.error('Ошибка при загрузке категорий');
    }
  };

  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchData(1, newFilters);
  }, []);

  const loadMore = () => {
    if (!filterLoading && hasMore) fetchData(page + 1, filters);
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
            <Link to="/pets" className="btn btn-outline">Посмотреть все</Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="filters-section">
        <SearchFilters onFilter={handleFilter} loading={filterLoading} />
      </div>

      {/* Categories */}
      <section className="categories-section">
        <h2>Популярные категории</h2>
        <div className="categories-grid">
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat.id} to={`/pets?category=${cat.id}`} className="category-card">
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
