// frontend/src/components/SearchFilters.jsx
import React, { useState } from 'react';
import '../styles/Filters.css';

function SearchFilters({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    search: '',
    species: '',  // ← ИСПРАВЛЕНО: species вместо breed
    minPrice: '',
    maxPrice: '',
  });

  const speciesOptions = [  // ← ИСПРАВЛЕНО: speciesOptions
    { value: '', label: 'Все животные' },
    { value: 'dog', label: 'Собаки' },
    { value: 'cat', label: 'Кошки' },
    { value: 'bird', label: 'Птицы' },
    { value: 'fish', label: 'Рыбы' },
    { value: 'rodent', label: 'Грызуны' },
    { value: 'reptile', label: 'Рептилии' },
    { value: 'other', label: 'Другое' },
  ];

  const handleChange = (name, value) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilter(updated);
  };

  const clearFilters = () => {
    const reset = { search: '', species: '', minPrice: '', maxPrice: '' }; // ← ИСПРАВЛЕНО
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
            value={filters.species}  // ← ИСПРАВЛЕНО
            onChange={(e) => handleChange('species', e.target.value)}  // ← ИСПРАВЛЕНО
          >
            {speciesOptions.map((opt) => (  // ← ИСПРАВЛЕНО
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