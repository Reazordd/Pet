import React, { createContext, useState, useEffect } from "react";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (pet) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === pet.id);
      return exists ? prev.filter((f) => f.id !== pet.id) : [...prev, pet];
    });
  };

  const isFavorite = (petId) => favorites.some((f) => f.id === petId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
