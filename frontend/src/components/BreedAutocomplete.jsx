// frontend/src/components/BreedAutocomplete.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const BreedAutocomplete = ({ species, value, onChange, placeholder = "Порода (например: Лабрадор)" }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Закрываем выпадающий список при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Загружаем породы при изменении inputValue или species
  useEffect(() => {
    if (!species || !isOpen) return;

    const fetchBreeds = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (inputValue) params.append('q', inputValue);
        params.append('species', species);
        const res = await api.get(`/breeds/?${params.toString()}`);
        setOptions(res.data);
      } catch (err) {
        console.warn('Ошибка загрузки пород:', err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchBreeds, 300);
    return () => clearTimeout(timer);
  }, [inputValue, species, isOpen]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    if (val.trim() && species) {
      setIsOpen(true);
    }
  };

  const handleSelect = (breed) => {
    setInputValue(breed);
    onChange(breed);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (species && inputValue.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-60 overflow-auto">
          {isLoading ? (
            <li className="p-2 text-center text-gray-500">Загрузка...</li>
          ) : options.length > 0 ? (
            options.map((breed, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(breed)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {breed}
              </li>
            ))
          ) : (
            <li className="p-2 text-center text-gray-500">Породы не найдены</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default BreedAutocomplete;