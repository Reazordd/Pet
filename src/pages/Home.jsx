import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function Home() {
    const [pets, setPets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [petsResponse, categoriesResponse] = await Promise.all([
                api.get('/pets/'),
                api.get('/categories/')
            ]);

            setPets(petsResponse.data.results || petsResponse.data);
            setCategories(categoriesResponse.data.results || categoriesResponse.data);
        } catch (err) {
            setError('Ошибка при загрузке данных');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="home">
                <h1>Все объявления</h1>
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="home">
            <div className="hero-section">
                <h1>Найдите своего идеального питомца</h1>
                <p>Тысячи животных ждут своего нового дома</p>
            </div>

            <section className="categories-section">
                <h2>Категории</h2>
                <div className="categories-grid">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="category-card">
                                <Skeleton height={100} />
                                <Skeleton width={100} />
                            </div>
                        ))
                    ) : (
                        categories.map(category => (
                            <div key={category.id} className="category-card">
                                <span className="category-icon">{category.icon || '🐾'}</span>
                                <h3>{category.name}</h3>
                                <p>{category.pet_count || 0} объявлений</p>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="pets-section">
                <div className="section-header">
                    <h2>Последние объявления</h2>
                    <Link to="/create" className="btn btn-primary">
                        Разместить объявление
                    </Link>
                </div>

                <div className="pets-grid">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="pet-card">
                                <Skeleton height={200} />
                                <Skeleton count={3} />
                            </div>
                        ))
                    ) : pets.length > 0 ? (
                        pets.map(pet => (
                            <PetCard key={pet.id} pet={pet} />
                        ))
                    ) : (
                        <div className="empty-state">
                            <h3>Объявления не найдены</h3>
                            <p>Будьте первым, кто разместит объявление!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;