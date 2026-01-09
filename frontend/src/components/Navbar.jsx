// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { checkToken, logout } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import "../styles/Navbar.css";

function Navbar() {
  const location = useLocation();
  const isAuthenticated = checkToken();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
          {/* 🔥 ФОРУМ ВРЕМЕННО УДАЛЁН */}
          {/* <Link className={`nav-link ${location.pathname === "/forum" ? "active" : ""}`} to="/forum">
            Форум
          </Link> */}

          {isAuthenticated ? (
            <>
              <Link className={`nav-link ${location.pathname === "/favorites" ? "active" : ""}`} to="/favorites">
                ❤️ Избранное
              </Link>
              <Link className={`nav-link ${location.pathname === "/messages" ? "active" : ""}`} to="/messages">
                💬 Сообщения
              </Link>
              <Link className={`nav-link ${location.pathname === "/notifications" ? "active" : ""}`} to="/notifications">
                🔔 Уведомления
                {!loading && unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
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