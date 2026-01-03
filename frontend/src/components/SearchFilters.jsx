// frontend/src/components/SearchFilters.jsx
import React, { useState } from 'react';
import BreedAutocomplete from './BreedAutocomplete';
import '../styles/Filters.css';

function SearchFilters({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    search: '',
    species: 'dog',
    breed: '',
    age_group: '', // ← ДОБАВЛЕНО
    minPrice: '',
    maxPrice: '',
  });

  const speciesOptions = [
    { value: '', label: 'Все животные' },
    { value: 'dog', label: 'Собаки' },
    { value: 'cat', label: 'Кошки' },
    { value: 'bird', label: 'Птицы' },
    { value: 'fish', label: 'Рыбы' },
    { value: 'rodent', label: 'Грызуны' },
    { value: 'reptile', label: 'Рептилии' },
    { value: 'other', label: 'Другое' },
  ];

  // 🔥 НОВОЕ: варианты возраста
  const ageOptions = [
    { value: '', label: 'Любой возраст' },
    { value: 'puppy', label: 'До 1 года' },
    { value: 'young', label: '1–3 года' },
    { value: 'adult', label: '3–7 лет' },
    { value: 'senior', label: 'Старше 7 лет' },
  ];

  const handleChange = (name, value) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilter(updated);
  };

  const clearFilters = () => {
    const reset = { search: '', species: 'dog', breed: '', age_group: '', minPrice: '', maxPrice: '' };
    setFilters(reset);
    onFilter(reset);
  };

  return (
    <div className="filters-box">
      <div className="filters-header">
        <h3>Фильтр объявлений</h3>
        <button onClick={clearFilters} disabled={loading} className="clear-btn">
          Сбросить
        </button>
      </div>

      <div className="filters-grid">
        <div className="filter-item">
          <label>Поиск</label>
          <input
            type="text"
            placeholder="Введите имя или описание"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>Тип животного</label>
          <select
            value={filters.species}
            onChange={(e) => handleChange('species', e.target.value)}
          >
            {speciesOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Порода</label>
          <BreedAutocomplete
            species={filters.species || 'dog'}
            value={filters.breed}
            onChange={(breed) => handleChange('breed', breed)}
            placeholder="Порода (например: Лабрадор)"
          />
        </div>

        {/* 🔥 НОВОЕ: Выпадающий список возраста */}
        <div className="filter-item">
          <label>Возраст</label>
          <select
            value={filters.age_group}
            onChange={(e) => handleChange('age_group', e.target.value)}
          >
            {ageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Цена (₽)</label>
          <div className="filter-range">
            <input
              type="number"
              placeholder="от"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
            />
            <span>—</span>
            <input
              type="number"
              placeholder="до"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchFilters;