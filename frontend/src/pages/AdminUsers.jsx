// frontend/src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import "../styles/Admin.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users/");
      setUsers(res.data.results ?? res.data);
    } catch {
      toast.error("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (user) => {
    try {
      const action = user.is_active ? "block" : "unblock";
      await api.post(`/admin/users/${user.id}/${action}/`);
      toast.success(`Пользователь ${action === "block" ? "заблокирован" : "разблокирован"}`);
      fetchUsers();
    } catch {
      toast.error("Ошибка при обновлении статуса пользователя");
    }
  };

  return (
    <div className="admin-page">
      <h1>Управление пользователями</h1>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Логин</th>
                <th>Email</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.is_active ? "Да" : "Нет"}</td>
                  <td>
                    <button onClick={() => toggleBlock(u)}>
                      {u.is_active ? "Заблокировать" : "Разблокировать"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
