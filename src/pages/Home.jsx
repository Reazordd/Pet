import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import SearchFilters from '../components/SearchFilters';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
                ...currentFilters
            });

            // Remove empty filters
            Object.keys(currentFilters).forEach(key => {
                if (!currentFilters[key]) {
                    params.delete(key);
                }
            });

            const response = await api.get(`/pets/?${params}`);
            const newPets = response.data.results || response.data;

            if (pageNum === 1) {
                setPets(newPets);
            } else {
                setPets(prev => [...prev, ...newPets]);
            }

            setHasMore(newPets.length === 12);
            setPage(pageNum);
        } catch (error) {
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
        } catch (error) {
            toast.error('Ошибка при загрузке категорий');
        }
    };

    const handleFilter = useCallback((newFilters) => {
        setFilters(newFilters);
        fetchData(1, newFilters);
    }, []);

    const loadMore = () => {
        if (!filterLoading && hasMore) {
            fetchData(page + 1, filters);
        }
    };

    const featuredPets = pets.slice(0, 6);

    return (
        <div className="home">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Найдите своего идеального питомца</h1>
                    <p>Тысячи животных ждут своего нового дома. Безопасные сделки с гарантией.</p>
                    <div className="hero-actions">
                        <Link to="/create" className="btn btn-primary btn-large">
                            🐾 Разместить объявление
                        </Link>
                        <Link to="/pets" className="btn btn-secondary btn-large">
                            🔍 Смотреть всех
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search Filters */}
            <SearchFilters onFilter={handleFilter} loading={filterLoading} />

            {/* Featured Pets */}
            <section className="featured-section">
                <h2>🔥 Животные недели</h2>
                <div className="pets-grid">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="pet-card">
                                <Skeleton height={200} />
                                <Skeleton count={3} />
                            </div>
                        ))
                    ) : featuredPets.length > 0 ? (
                        featuredPets.map(pet => (
                            <PetCard key={pet.id} pet={pet} />
                        ))
                    ) : (
                        <div className="empty-state">
                            <h3>Объявления не найдены</h3>
                            <p>Попробуйте изменить параметры поиска</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <h2>📂 Популярные категории</h2>
                <div className="categories-grid">
                    {categories.slice(0, 6).map(category => (
                        <Link
                            key={category.id}
                            to={`/pets?category=${category.id}`}
                            className="category-card"
                        >
                            <span className="category-icon">{category.icon || '🐾'}</span>
                            <h3>{category.name}</h3>
                            <p>{category.pet_count || 0} объявлений</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* All Pets */}
            <section className="all-pets-section">
                <div className="section-header">
                    <h2>Все объявления</h2>
                    <div className="pets-count">
                        Найдено: {pets.length} объявлений
                    </div>
                </div>

                <div className="pets-grid">
                    {pets.map(pet => (
                        <PetCard key={pet.id} pet={pet} />
                    ))}
                </div>

                {hasMore && !loading && (
                    <div className="load-more">
                        <button
                            onClick={loadMore}
                            className="btn btn-primary"
                            disabled={filterLoading}
                        >
                            {filterLoading ? 'Загрузка...' : '📃 Показать еще'}
                        </button>
                    </div>
                )}

                {!hasMore && pets.length > 0 && (
                    <div className="end-message">
                        <p>🎉 Вы просмотрели все объявления!</p>
                    </div>
                )}
            </section>

            {/* Stats Banner */}
            <div className="stats-banner">
                <div className="stat-item">
                    <div className="stat-number">1000+</div>
                    <div className="stat-label">Довольных клиентов</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Успешных сделок</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Поддержка</div>
                </div>
            </div>
        </div>
    );
}

export default Home;