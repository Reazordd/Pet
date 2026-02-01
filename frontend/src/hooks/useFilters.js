// frontend/src/hooks/useFilters.js
import { useSearchParams, useNavigate } from 'react-router-dom';

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const getFilter = (key) => {
    return searchParams.get(key) || '';
  };

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const applyFilters = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null && value !== '') {
        params.set(key, String(value));
      }
    });
    navigate(`/?${params.toString()}`);
  };

  return {
    getFilter,
    setFilter,
    clearFilters,
    applyFilters,
    searchParams,
  };
};