// frontend/src/context/FavoritesContext.jsx


import React, { createContext, useContext, useEffect, useState } from "react";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(saved);
    } catch {
      setFavorites([]);
    }
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((fid) => fid !== id)
        : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (id) => favorites.includes(id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
