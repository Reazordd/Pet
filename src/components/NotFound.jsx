import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div className="not-found">
            <div className="not-found-content">
                <div className="not-found-icon">😕</div>
                <h1>Страница не найдена</h1>
                <p>Извините, мы не можем найти страницу, которую вы ищете.</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn btn-primary">
                        🏠 На главную
                    </Link>
                    <button onClick={() => window.history.back()} className="btn btn-secondary">
                        ↩️ Назад
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFound