// frontend/src/components/FiltersModal.jsx
import React, { useState, useEffect } from 'react';
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
  // ✅ Используем только локальное состояние — без хуков внутри
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age_group, setAgeGroup] = useState('');
  const [min_price, setMinPrice] = useState('');
  const [max_price, setMaxPrice] = useState('');

  // Синхронизируем при открытии (без хуков!)
  useEffect(() => {
    if (isOpen) {
      // Здесь можно было бы читать из URL, но для простоты — оставим пустым
      // Если нужно — добавьте:
      // const url = new URL(window.location.href);
      // setQ(url.searchParams.get('q') || '');
    }
  }, [isOpen]);

  const handleApply = () => {
    // Отправляем через window.location — чтобы не зависеть от useFilters
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (city) params.append('city', city);
    if (species) params.append('species', species);
    if (breed) params.append('breed', breed);
    if (age_group) params.append('age_group', age_group);
    if (min_price) params.append('min_price', min_price);
    if (max_price) params.append('max_price', max_price);

    window.location.href = `/?${params.toString()}`;
    onClose();
  };

  const handleClear = () => {
    setQ('');
    setCity('');
    setSpecies('');
    setBreed('');
    setAgeGroup('');
    setMinPrice('');
    setMaxPrice('');
    window.location.href = '/';
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
              autoFocus // ← Добавлено для надёжности
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
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
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
            <select
              value={age_group}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
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