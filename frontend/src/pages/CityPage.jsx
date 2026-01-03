// frontend/src/pages/CityPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PetCard from '../components/PetCard';
import SearchFilters from '../components/SearchFilters';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../utils/api';

export default function CityPage() {
  const { citySlug, species } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [seo, setSeo] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  const initialFilters = {
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '', // ← ДОБАВЛЕНО
    species: searchParams.get('species') || '',
    breed: searchParams.get('breed') || '',
    age_group: searchParams.get('age_group') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
  };
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoading(true);
        const url = species
          ? `/city/${citySlug}/${species}/`
          : `/city/${citySlug}/`;

        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.city) params.append('city', filters.city); // ← ДОБАВЛЕНО
        if (filters.breed) params.append('breed', filters.breed);
        if (filters.age_group) params.append('age_group', filters.age_group);
        if (filters.minPrice) params.append('min_price', filters.minPrice);
        if (filters.maxPrice) params.append('max_price', filters.maxPrice);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const res = await api.get(`${url}${queryString}`);

        const { pets: petsData, seo: seoData } = res.data.results;
        setPets(petsData);
        setSeo(seoData);
        document.title = seoData.title;
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        const cityDisplay = citySlug.replace('-', ' ').title();
        const speciesDisplay = species ?
          ({'dog':'собаки','cat':'кошки','bird':'птицы','rodent':'грызуны','fish':'рыбы','reptile':'рептилии','other':'другие'})[species]
          : 'все животные';
        setSeo({
          title: `Объявления в ${cityDisplay} — PetMarket`,
          description: ''
        });
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    loadPets();
  }, [citySlug, species, JSON.stringify(filters)]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.search) params.append('search', newFilters.search);
    if (newFilters.city) params.append('city', newFilters.city); // ← ДОБАВЛЕНО
    if (newFilters.breed) params.append('breed', newFilters.breed);
    if (newFilters.age_group) params.append('age_group', newFilters.age_group);
    if (newFilters.minPrice) params.append('min_price', newFilters.minPrice);
    if (newFilters.maxPrice) params.append('max_price', newFilters.maxPrice);
    setSearchParams(params);
  };

  return (
    <div className="city-page max-w-6xl mx-auto p-4">
      <div className="filters-section mb-6">
        <SearchFilters onFilter={handleFilter} loading={loading} />
      </div>
      <h1 className="text-2xl font-bold mb-4">{seo.title}</h1>
      <div className="pets-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="col-span-full text-center py-10">
            <p>Объявлений не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}