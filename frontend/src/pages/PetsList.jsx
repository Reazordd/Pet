// frontend/src/pages/PetsList.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import PetCard from "../components/PetCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "../styles/PetsList.css";

function PetsList() {
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    min_price: "",
    max_price: "",
    search: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchPets();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data.results ?? response.data);
    } catch {
      toast.error("Ошибка при загрузке категорий");
    }
  };

  const fetchPets = async (params = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/pets/?${query}`);
      setPets(response.data.results || response.data);
    } catch {
      toast.error("Ошибка при загрузке объявлений");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPets(filters);
  };

  const resetFilters = () => {
    const cleared = { category: "", min_price: "", max_price: "", search: "" };
    setFilters(cleared);
    fetchPets({});
  };

  return (
    <div className="pets-page">
      {/* Фильтры слева */}
      <aside className="filters-panel">
        <h2>Фильтры</h2>
        <form onSubmit={handleSearch}>
          <div className="filter-group">
            <label>Поиск</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Имя, порода..."
            />
          </div>

          <div className="filter-group">
            <label>Категория</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
            >
              <option value="">Все категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Цена, ₽</label>
            <div className="price-range">
              <input
                type="number"
                name="min_price"
                placeholder="от"
                value={filters.min_price}
                onChange={handleChange}
              />
              <input
                type="number"
                name="max_price"
                placeholder="до"
                value={filters.max_price}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary w-full">
              🔍 Найти
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={resetFilters}
            >
              ❌ Сбросить
            </button>
          </div>
        </form>
      </aside>

      {/* Результаты справа */}
      <main className="results-panel">
        <div className="results-header">
          <h1>Объявления</h1>
          <span className="results-count">{pets.length} найдено</span>
        </div>

        <div className="pets-grid">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="pet-card">
                <Skeleton height={200} />
                <Skeleton count={3} />
              </div>
            ))
          ) : pets.length > 0 ? (
            pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
          ) : (
            <div className="empty-state">
              <p>😿 Объявления не найдены</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PetsList;
