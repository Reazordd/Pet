// frontend/src/components/Navbar.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { checkToken, logout } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import "../styles/Navbar.css";

function Navbar() {
  const location = useLocation();
  const isAuthenticated = checkToken();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="nav-wrap dark:bg-gray-900 dark:text-white">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-logo">🐾 PetMarket</span>
        </Link>

        <nav className="nav-links">
          <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">
            Главная
          </Link>
          <Link className={`nav-link ${location.pathname.startsWith("/pets") ? "active" : ""}`} to="/pets">
            Объявления
          </Link>
          <Link className={`nav-link ${location.pathname === "/forum" ? "active" : ""}`} to="/forum">
            Форум
          </Link>

          {isAuthenticated ? (
            <>
              <Link className={`nav-link ${location.pathname === "/favorites" ? "active" : ""}`} to="/favorites">
                ❤️ Избранное
              </Link>
              <Link className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`} to="/messages">
                💬 Сообщения
              </Link>
              <Link className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`} to="/profile">
                👤 Профиль
              </Link>
              <button className="nav-logout" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link className={`nav-link ${location.pathname === "/login" ? "active" : ""}`} to="/login">
                Вход
              </Link>
              <Link className="nav-cta" to="/register">
                Регистрация
              </Link>
            </>
          )}
        </nav>

        <div className="theme-toggle">
          <button onClick={toggleTheme} aria-label="toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
