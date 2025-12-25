// frontend/src/utils/image.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const buildImageUrl = (path) => {
  // Защита от null, undefined, объектов, чисел и т.д.
  if (!path || typeof path !== 'string') {
    return '/images/placeholder-avatar.png';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};