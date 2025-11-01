// frontend/src/pages/AdminDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Admin.css";

function AdminDashboard() {
  return (
    <div className="admin-page">
      <h1>Панель администратора</h1>
      <div className="admin-grid">
        <Link to="/admin/users" className="admin-card">
          <h3>Пользователи</h3>
          <p>Просмотр, блокировка/разблокировка пользователей</p>
        </Link>
        <Link to="/admin/ads" className="admin-card">
          <h3>Объявления</h3>
          <p>Модерировать объявления: скрыть, показать, удалить</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
