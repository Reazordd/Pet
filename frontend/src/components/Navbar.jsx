import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { checkToken, logout } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import FiltersModal from "./FiltersModal";
import "../styles/Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = checkToken();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count/');
        setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.error('Ошибка загрузки уведомлений:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchInput = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim() === '') {
      navigate('/');
    } else {
      navigate(`/?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const openFilters = () => {
    setIsFiltersOpen(true);
  };

  return (
    <header className="nav-wrap dark:bg-gray-900 dark:text-white">
      {/* Десктопная навигация */}
      <div className="nav-inner-desktop">
        <Link to="/" className="nav-brand">
          <span className="brand-logo">🐾 PetMarket</span>
        </Link>

        <div className="search-form">
          <input
            type="text"
            placeholder="Что ищете? Например: щенок, кот..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onInput={handleSearchInput}
            className="search-input"
          />
          <button type="button" onClick={openFilters} className="filters-btn">
            Фильтры
          </button>
        </div>

        <nav className="nav-links">
          <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Главная</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link className={`nav-link ${location.pathname === "/favorites" ? "active" : ""}`} to="/favorites">
                <span className="nav-icon">❤️</span>
                <span className="nav-text">Избранное</span>
              </Link>
              <Link className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`} to="/messages">
                <span className="nav-icon">💬</span>
                <span className="nav-text">Сообщения</span>
              </Link>
              <Link className={`nav-link ${location.pathname === "/notifications" ? "active" : ""}`} to="/notifications">
                <span className="nav-icon">🔔</span>
                <span className="nav-text">Уведомления</span>
                {!loading && unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
              <Link className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`} to="/profile">
                <span className="nav-icon">👤</span>
                <span className="nav-text">Профиль</span>
              </Link>
              <button className="nav-logout" onClick={handleLogout}>
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Выйти</span>
              </button>
            </>
          ) : (
            <>
              <Link className={`nav-link ${location.pathname === "/login" ? "active" : ""}`} to="/login">
                <span className="nav-icon">🔑</span>
                <span className="nav-text">Вход</span>
              </Link>
              <Link className="nav-cta" to="/register">
                <span className="nav-icon">📝</span>
                <span className="nav-text">Регистрация</span>
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

      {/* Мобильная навигация */}
      <div className="nav-inner-mobile">
        <div className="mobile-search-bar">
          <input
            type="text"
            placeholder="Поиск питомцев..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onInput={handleSearchInput}
            className="mobile-search-input"
          />
          <button type="button" onClick={openFilters} className="mobile-filters-btn">
            🔍
          </button>
        </div>

        <div className="mobile-nav-icons">
          <Link to="/" className="mobile-nav-item">
            <span>🏠</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="mobile-nav-item">
                <span>❤️</span>
              </Link>
              <Link to="/messages" className="mobile-nav-item">
                <span>💬</span>
              </Link>
              <Link to="/notifications" className="mobile-nav-item">
                <span>🔔</span>
                {unreadCount > 0 && <span className="mobile-badge">{unreadCount}</span>}
              </Link>
              <Link to="/profile" className="mobile-nav-item">
                <span>👤</span>
              </Link>
              {/* Кнопка переключения темы для авторизованных */}
              <button
                className="mobile-nav-item theme-toggle-mobile"
                onClick={toggleTheme}
                aria-label={`Переключить на ${theme === 'light' ? 'тёмную' : 'светлую'} тему`}
              >
                <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-item">
                <span>🔑</span>
              </Link>
              {/* Кнопка переключения темы для гостей */}
              <button
                className="mobile-nav-item theme-toggle-mobile"
                onClick={toggleTheme}
                aria-label={`Переключить на ${theme === 'light' ? 'тёмную' : 'светлую'} тему`}
              >
                <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
      />
    </header>
  );
}

export default Navbar;