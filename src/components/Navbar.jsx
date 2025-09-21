import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { checkToken, logout } from '../utils/auth';

function Navbar() {
    const location = useLocation();
    const isAuthenticated = checkToken();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    🐾 PetMarket
                </Link>

                <ul className="nav-links">
                    <li>
                        <Link
                            to="/"
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            Главная
                        </Link>
                    </li>

                    {isAuthenticated ? (
                        <>
                            <li>
                                <Link
                                    to="/mypets"
                                    className={`nav-link ${location.pathname === '/mypets' ? 'active' : ''}`}
                                >
                                    Мои объявления
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/create"
                                    className={`nav-link ${location.pathname === '/create' ? 'active' : ''}`}
                                >
                                    Создать объявление
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/profile"
                                    className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                                >
                                    Профиль
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', fontSize: '14px' }}
                                >
                                    Выйти
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link
                                    to="/login"
                                    className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                                >
                                    Вход
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                                >
                                    Регистрация
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;