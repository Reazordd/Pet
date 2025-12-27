// frontend/src/pages/PetsList.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PetCard from '../components/PetCard'; // ← ИСПОЛЬЗУЕМ PetCard


function PetsList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Фильтры
  const [filters, setFilters] = useState({
    species: '',
    offer_type: '',
    city: '',
    breed: '',
    min_price: '',
    max_price: '',
    search: '',
  });

  // Пагинация
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', page);

      const res = await api.get(`/pets/?${params.toString()}`);
      setPets(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / 12));
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить объявления');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Сброс на первую страницу при смене фильтра
  };

  const resetFilters = () => {
    setFilters({
      species: '',
      offer_type: '',
      city: '',
      breed: '',
      min_price: '',
      max_price: '',
      search: '',
    });
    setPage(1);
  };

  return (
    <div className="pets-list-page max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Объявления о животных</h1>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-1">Вид животного</label>
            <select
              name="species"
              value={filters.species}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Любой</option>
              <option value="dog">Собака</option>
              <option value="cat">Кошка</option>
              <option value="bird">Птица</option>
              <option value="rodent">Грызун</option>
              <option value="fish">Рыба</option>
              <option value="reptile">Рептилия</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Тип объявления</label>
            <select
              name="offer_type"
              value={filters.offer_type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Любой</option>
              <option value="sale">Продажа</option>
              <option value="giveaway">Отдам</option>
              <option value="search">Ищу</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Город</label>
            <input
              type="text"
              name="city"
              placeholder="Например: Москва"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Порода</label>
            <input
              type="text"
              name="breed"
              placeholder="Например: Лабрадор"
              value={filters.breed}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Цена от (₽)</label>
            <input
              type="number"
              name="min_price"
              value={filters.min_price}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Цена до (₽)</label>
            <input
              type="number"
              name="max_price"
              value={filters.max_price}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Поиск</label>
            <input
              type="text"
              name="search"
              placeholder="Поиск по названию или описанию"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-center mt-10">Загрузка...</p>
      ) : pets.length === 0 ? (
        <p className="text-center mt-10 text-gray-500">Объявлений не найдено.</p>
      ) : (
        <>
          {/* ✅ ИСПОЛЬЗУЕМ PetCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} size="small" />
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Назад
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'border'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PetsList;