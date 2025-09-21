import React, { useState } from 'react';

function SearchFilters({ onFilter, loading }) {
    const [filters, setFilters] = useState({
        breed: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        minAge: '',
        maxAge: '',
        search: ''
    });

    const breedOptions = [
        { value: '', label: 'Все виды' },
        { value: 'dog', label: 'Собаки' },
        { value: 'cat', label: 'Кошки' },
        { value: 'bird', label: 'Птицы' },
        { value: 'fish', label: 'Рыбы' },
        { value: 'rodent', label: 'Грызуны' },
        { value: 'reptile', label: 'Рептилии' },
        { value: 'other', label: 'Другие' }
    ];

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            breed: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            minAge: '',
            maxAge: '',
            search: ''
        };
        setFilters(emptyFilters);
        onFilter(emptyFilters);
    };

    return (
        <div className="search-filters">
            <div className="filters-header">
                <h3>🔍 Фильтры поиска</h3>
                <button
                    onClick={clearFilters}
                    className="btn btn-secondary btn-small"
                    disabled={loading}
                >
                    ❌ Очистить
                </button>
            </div>

            <div className="filters-grid">
                {/* Search Input */}
                <div className="filter-group">
                    <label>Поиск по названию</label>
                    <input
                        type="text"
                        placeholder="Название животного..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        disabled={loading}
                    />
                </div>

                {/* Breed Filter */}
                <div className="filter-group">
                    <label>Вид животного</label>
                    <select
                        value={filters.breed}
                        onChange={(e) => handleFilterChange('breed', e.target.value)}
                        disabled={loading}
                    >
                        {breedOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div className="filter-group">
                    <label>Цена (₽)</label>
                    <div className="range-inputs">
                        <input
                            type="number"
                            placeholder="От"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            disabled={loading}
                            min="0"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="До"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            disabled={loading}
                            min="0"
                        />
                    </div>
                </div>

                {/* Age Range */}
                <div className="filter-group">
                    <label>Возраст (лет)</label>
                    <div className="range-inputs">
                        <input
                            type="number"
                            placeholder="От"
                            value={filters.minAge}
                            onChange={(e) => handleFilterChange('minAge', e.target.value)}
                            disabled={loading}
                            min="0"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="До"
                            value={filters.maxAge}
                            onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                            disabled={loading}
                            min="0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchFilters;