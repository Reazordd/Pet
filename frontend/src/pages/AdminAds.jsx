// frontend/src/pages/AdminAds.jsx


import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import "../styles/Admin.css";
import PetCard from "../components/PetCard";

function AdminAds() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pets/");
      setPets(res.data.results ?? res.data);
    } catch {
      toast.error("Ошибка загрузки объявлений");
    } finally {
      setLoading(false);
    }
  };

  const hideShow = async (pet, action) => {
    try {
      await api.post(`/admin/pets/${pet.id}/${action}/`);
      toast.success(action === "hide" ? "Объявление скрыто" : "Объявление показано");
      fetchPets();
    } catch {
      toast.error("Ошибка модерации объявления");
    }
  };

  const remove = async (pet) => {
    if (!window.confirm("Удалить объявление навсегда?")) return;
    try {
      await api.post(`/admin/pets/${pet.id}/delete_permanently/`);
      toast.success("Объявление удалено");
      fetchPets();
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  return (
    <div className="admin-page">
      <h1>Модерация объявлений</h1>

      {loading ? (
        <p>Загрузка...</p>
      ) : pets.length === 0 ? (
        <p>Нет объявлений</p>
      ) : (
        <div className="admin-ads-grid">
          {pets.map((p) => (
            <div key={p.id} className="admin-ad-card">
              <PetCard pet={p} />
              <div className="admin-ad-actions">
                {p.is_active ? (
                  <button onClick={() => hideShow(p, "hide")}>Скрыть</button>
                ) : (
                  <button onClick={() => hideShow(p, "show")}>Показать</button>
                )}
                <button onClick={() => remove(p)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAds;
