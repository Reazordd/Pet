// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../styles/Home.css';

function Home() {
  const [searchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUserLocation = async () => {
    try {
      const res = await api.get("/auth/profile/me/");
      return res.data.location || null;
    } catch {
      return null;
    }
  };

  const fetchData = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      const params = new URLSearchParams({
        page: pageNum,
        page_size: 12,
      });

      const q = searchParams.get('q') || '';
      const city = searchParams.get('city') || '';
      const species = searchParams.get('species') || '';
      const breed = searchParams.get('breed') || '';
      const age_group = searchParams.get('age_group') || '';
      const min_price = searchParams.get('min_price') || '';
      const max_price = searchParams.get('max_price') || '';

      if (q) params.append('search', q);
      if (city) params.append('city', city);
      if (species) params.append('species', species);
      if (breed) params.append('breed', breed);
      if (age_group) params.append('age_group', age_group);
      if (min_price) params.append('min_price', min_price);
      if (max_price) params.append('max_price', max_price);

      let finalCity = city;
      if (!finalCity && !q) {
        const userLoc = await fetchUserLocation();
        if (userLoc) finalCity = userLoc;
      }
      if (finalCity) params.append('city', finalCity);

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
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [searchParams]);

  const loadMore = () => {
    if (hasMore) {
      fetchData(page + 1);
    }
  };

  // 🔥 Динамический заголовок
  const getHeaderTitle = () => {
    const q = searchParams.get('q');
    const city = searchParams.get('city');

    if (q) {
      return 'Результаты поиска';
    }
    if (city) {
      return `Объявления в ${city}`;
    }
    return 'Объявления в вашем городе';
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
            <Link to="/all" className="btn btn-outline">Посмотреть все</Link>
          </div>
        </div>
      </section>

      {/* Ads */}
      <section className="ads-section">
        <div className="ads-header">
          <h2>{getHeaderTitle()}</h2>
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
              {searchParams.toString() ? (
                <>
                  <h3>Ничего не найдено</h3>
                  <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                </>
              ) : (
                <>
                  <h3>😿 Объявлений не найдено</h3>
                  <p>Попробуйте изменить фильтры или категорию.</p>
                </>
              )}
            </div>
          )}
        </div>

        {hasMore && !loading && (
          <div className="load-more">
            <button onClick={loadMore}>
              Показать ещё
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;