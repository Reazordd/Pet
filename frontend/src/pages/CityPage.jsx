// frontend/src/pages/CityPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PetCard from '../components/PetCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../utils/api';

export default function CityPage() {
  const { citySlug, species } = useParams();
  const [searchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [seo, setSeo] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoading(true);
        const url = species
          ? `/city/${citySlug}/${species}/`
          : `/city/${citySlug}/`;

        const params = new URLSearchParams();

        // Все фильтры из URL
        const q = searchParams.get('q');
        const breed = searchParams.get('breed');
        const age_group = searchParams.get('age_group');
        const min_price = searchParams.get('min_price');
        const max_price = searchParams.get('max_price');

        if (q) params.append('search', q);
        if (breed) params.append('breed', breed);
        if (age_group) params.append('age_group', age_group);
        if (min_price) params.append('min_price', min_price);
        if (max_price) params.append('max_price', max_price);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const res = await api.get(`${url}${queryString}`);

        const data = res.data.results || res.data;
        const petsData = data.pets || [];
        const seoData = data.seo || { title: '', description: '' };

        setPets(petsData);
        setSeo(seoData);
        document.title = seoData.title || `Объявления в ${citySlug.replace('-', ' ')}`;
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        const cityDisplay = citySlug.replace('-', ' ');
        const speciesLabels = {
          dog: 'собаки',
          cat: 'кошки',
          bird: 'птицы',
          rodent: 'грызуны',
          fish: 'рыбы',
          reptile: 'рептилии',
          other: 'другие'
        };
        const speciesDisplay = species ? speciesLabels[species] || 'животные' : 'все животные';
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
  }, [citySlug, species, searchParams]); // ← зависимость от URL

  return (
    <div className="city-page max-w-6xl mx-auto p-4">
      {/* ❌ УДАЛЕН БЛОК ФИЛЬТРОВ */}

      <h1 className="text-2xl font-bold mb-4">{seo.title || `Объявления в ${citySlug.replace('-', ' ')}`}</h1>
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