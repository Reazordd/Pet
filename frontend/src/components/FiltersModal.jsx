// frontend/src/components/FiltersModal.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BreedAutocomplete from './BreedAutocomplete';
import '../styles/FiltersModal.css';

const SPECIES_OPTIONS = [
  { value: '', label: 'Все животные' },
  { value: 'dog', label: 'Собаки' },
  { value: 'cat', label: 'Кошки' },
  { value: 'bird', label: 'Птицы' },
  { value: 'rodent', label: 'Грызуны' },
  { value: 'fish', label: 'Рыбы' },
  { value: 'reptile', label: 'Рептилии' },
  { value: 'other', label: 'Другое' },
];

const AGE_OPTIONS = [
  { value: '', label: 'Любой возраст' },
  { value: 'puppy', label: 'До 1 года' },
  { value: 'young', label: '1–3 года' },
  { value: 'adult', label: '3–7 лет' },
  { value: 'senior', label: 'Старше 7 лет' },
];

export default function FiltersModal({ isOpen, onClose }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Инициализируем состояния из URL
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [species, setSpecies] = useState(searchParams.get('species') || '');
  const [breed, setBreed] = useState(searchParams.get('breed') || '');
  const [age_group, setAgeGroup] = useState(searchParams.get('age_group') || '');
  const [min_price, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [max_price, setMaxPrice] = useState(searchParams.get('max_price') || '');

  // Синхронизируем с URL при открытии
  useEffect(() => {
    if (isOpen) {
      setQ(searchParams.get('q') || '');
      setCity(searchParams.get('city') || '');
      setSpecies(searchParams.get('species') || '');
      setBreed(searchParams.get('breed') || '');
      setAgeGroup(searchParams.get('age_group') || '');
      setMinPrice(searchParams.get('min_price') || '');
      setMaxPrice(searchParams.get('max_price') || '');
    }
  }, [isOpen, searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams();

    // Сохраняем все текущие фильтры
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (species) params.set('species', species);
    if (breed) params.set('breed', breed);
    if (age_group) params.set('age_group', age_group);
    if (min_price) params.set('min_price', min_price);
    if (max_price) params.set('max_price', max_price);

    setSearchParams(params, { replace: true });
    onClose();
  };

  const handleClear = () => {
    setSearchParams({}, { replace: true });
    setQ('');
    setCity('');
    setSpecies('');
    setBreed('');
    setAgeGroup('');
    setMinPrice('');
    setMaxPrice('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="filters-modal-overlay" onClick={onClose}>
      <div className="filters-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filters-modal-header">
          <h3>Фильтры</h3>
          <button onClick={handleClear} className="clear-filters-btn">
            Сбросить
          </button>
        </div>

        <div className="filters-modal-content">
          <div className="filter-row">
            <label>Поиск</label>
            <input
              type="text"
              placeholder="Имя, описание, порода"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <label>Город</label>
            <input
              type="text"
              placeholder="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <label>Тип животного</label>
            <select value={species} onChange={(e) => setSpecies(e.target.value)}>
              {SPECIES_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            <label>Порода</label>
            <BreedAutocomplete
              species={species}
              value={breed}
              onChange={setBreed}
              placeholder="Сначала выберите тип"
            />
          </div>

          <div className="filter-row">
            <label>Возраст</label>
            <select value={age_group} onChange={(e) => setAgeGroup(e.target.value)}>
              {AGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            <label>Цена (₽)</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="от"
                value={min_price}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                placeholder="до"
                value={max_price}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filters-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Отмена
          </button>
          <button className="btn-apply" onClick={handleApply}>
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}