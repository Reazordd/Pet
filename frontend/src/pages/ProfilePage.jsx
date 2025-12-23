// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import '../styles/SellerProfile.css';

function ProfilePage() {
  const { id: user_id_str } = useParams();
  const user_id = Number(user_id_str);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user_id || isNaN(user_id) || user_id <= 0) {
      setError('Некорректный ID пользователя');
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user_id, page]);

  const fetchProfile = async () => {
    try {
      const profileRes = await api.get(`/profile/${user_id}/`);
      setUser(profileRes.data);

      const petsRes = await api.get(`/pets/?user=${user_id}&page=${page}`);
      setPets(petsRes.data.results || []);
      setTotalPages(Math.ceil((petsRes.data.count || 0) / 12));
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err.response || err);
      setError('Профиль не найден');
      toast.error('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.info('Войдите, чтобы написать продавцу');
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentUserId = Number(decoded.user_id);

      if (currentUserId === user_id) {
        toast.warn('Нельзя написать самому себе');
        return;
      }

      const res = await api.post('/chat/create/', {
        target_user_id: user_id
      });

      const chatId = res.data.id;
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Ошибка создания чата:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Не удалось начать чат';
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10">Загрузка...</p></div>;
  if (error) return <div className="max-w-4xl mx-auto p-4"><p className="text-center mt-10 text-red-500">{error}</p></div>;
  if (!user) return null;

  const badges = user.badges || [
    { title: "Надёжный продавец", bgColor: "#E6F6FF", textColor: "#0071F0" },
    user.avito_delivery_count > 0 && {
      title: `${user.avito_delivery_count} покупок с Авито Доставкой`,
      bgColor: "#FFF8E6",
      textColor: "#FFA800"
    }
  ].filter(Boolean);

  return (
    <div className="seller-profile">
      <div className="seller-header">
        <div className="seller-avatar">
          {user.avatar ? (
            // ✅ Avito-стиль: круглый аватар 64px
            <img src={user.avatar} alt={user.username} className="avatar-lg" />
          ) : (
            <div className="avatar-placeholder">
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="seller-info">
          <h1>{user.username}</h1>

          <div className="mb-3">
            {badges.map((badge, idx) => (
              <span key={idx} className="badge" style={{ backgroundColor: badge.bgColor, color: badge.textColor }}>
                {badge.title}
              </span>
            ))}
          </div>

          {user.location && <p className="seller-location">📍 {user.location}</p>}
          {user.bio && <p className="seller-bio">{user.bio}</p>}

          <div className="seller-contacts">
            <button className="btn btn-primary" onClick={handleSendMessage}>
              💬 Написать
            </button>
            <button className="btn btn-secondary">
              📞 Позвонить
            </button>
          </div>
        </div>
      </div>

      <div className="seller-pets">
        <h2>Объявления пользователя</h2>
        {pets.length > 0 ? (
          <div className="pets-grid">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>У пользователя пока нет объявлений</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={page === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;