// frontend/src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

// 🔹 Иконки по типу уведомления
const getNotificationIcon = (verb) => {
  const iconMap = {
    'message': '💬',
    'moderation': '🛡️',
    'system': '⚙️',
    'like': '❤️',
    'follow': '👥',
    default: '🔔'
  };
  const key = verb.toLowerCase().includes('сообщение') ? 'message' :
             verb.toLowerCase().includes('модераци') ? 'moderation' :
             verb.toLowerCase().includes('лайк') ? 'like' :
             verb.toLowerCase().includes('подпис') ? 'follow' : 'system';
  return iconMap[key] || iconMap.default;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications/list/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Ошибка загрузки уведомлений:', err);
      toast.error('Не удалось загрузить уведомления');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/mark-read/${id}/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      toast.error('Ошибка при отметке уведомления');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('Все уведомления прочитаны');
    } catch (err) {
      toast.error('Не удалось отметить все уведомления');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/delete/${id}/`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      toast.error('Не удалось удалить уведомление');
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Удалить все уведомления? Это действие нельзя отменить.')) return;
    try {
      await api.delete('/notifications/clear-all/');
      setNotifications([]);
      toast.success('Все уведомления удалены');
    } catch (err) {
      toast.error('Не удалось очистить уведомления');
    }
  };

  // Формат даты: "14 февр., 22:07"
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'][date.getMonth()];
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month}, ${hour}:${min}`;
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="panel">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="panel">
          <div className="empty-state">
            <div className="icon">🔔</div>
            <h2 className="title">Нет уведомлений</h2>
            <p className="subtitle">Все спокойно — вы в курсе всех событий.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="panel">
        {/* Заголовок и действия */}
        <div className="header">
          <h1 className="page-title">Уведомления</h1>
          <div className="actions">
            {notifications.some(n => !n.is_read) && (
              <button
                className="action-link mark-all-link"
                onClick={markAllAsRead}
              >
                Отметить всё как прочитанное
              </button>
            )}
            {notifications.length > 0 && (
              <button
                className="action-link clear-all-link"
                onClick={clearAllNotifications}
              >
                Очистить всё
              </button>
            )}
          </div>
        </div>

        {/* Список уведомлений */}
        {notifications.map((n) => {
          const actorName = n.actor?.username || 'Система';
          const verbDisplay = n.get_verb_display || n.description || 'Событие';
          const icon = getNotificationIcon(verbDisplay);
          const isUnread = !n.is_read;

          return (
            <div key={n.id} className={`notification-item ${isUnread ? 'unread' : ''}`}>
              <div className="notification-line">
                <span className="icon">{icon}</span>
                <div className="text-block">
                  <span className="actor">{actorName}</span>
                  <span className="verb"> {verbDisplay}</span>
                  <span className="date">• {formatDate(n.created_at)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="delete-link"
                  aria-label="Удалить уведомление"
                >
                  ×
                </button>
              </div>

              {isUnread && (
                <div className="notification-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    className="mark-as-read-link"
                    aria-label="Отметить как прочитанное"
                  >
                    ✓ Отметить как прочитанное
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>



      {/* 🎨 CSS: точное соответствие скрину — тёмная панель на белом фоне */}
      <style>{`
        .notifications-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 16px;
          /* Фон страницы — белый (наследуется от Layout), без собственного фона */
        }

        .panel {
          background-color: #0d172a;
          color: #e0e6f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .header {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: #e0e6f0;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .action-link {
          font-size: 14px;
          line-height: 20px;
          font-weight: 500;
          color: #a0aabe;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }

        .mark-all-link {
          color: #00B85C;
        }
        .mark-all-link:hover {
          color: #009947;
          text-decoration: underline;
        }

        .clear-all-link {
          color: #FF4D4F;
        }
        .clear-all-link:hover {
          color: #cc3a3f;
          text-decoration: underline;
        }

        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid #222d42;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-line {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon {
          font-size: 18px;
          flex-shrink: 0;
          color: #c0c7d5;
        }

        .text-block {
          flex: 1;
          min-width: 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .actor {
          font-weight: 600;
          color: #e0e6f0;
        }

        .verb {
          color: #e0e6f0;
          margin-left: 4px;
        }

        .date {
          display: block;
          font-size: 12px;
          color: #a0aabe;
          margin-top: 2px;
        }

        .delete-link {
          font-size: 16px;
          line-height: 1;
          color: #a0aabe;
          background: none;
          border: none;
          cursor: pointer;
          width: 16px;
          height: 16px;
          text-align: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .delete-link:hover {
          color: #FF4D4F;
          background-color: rgba(255, 77, 79, 0.1);
        }

        .mark-as-read-link {
          font-size: 14px;
          line-height: 20px;
          color: #00B85C;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
        }

        .mark-as-read-link:hover {
          text-decoration: underline;
        }

        .notification-actions {
          margin-top: 8px;
          padding-left: 28px;
        }

        .footer {
          margin-top: 24px;
          padding: 16px;
          border-top: 1px solid #222d42;
          text-align: center;
          color: #a0aabe;
          font-size: 12px;
        }

        .copyright {
          margin: 0;
        }

        .link {
          color: #00B85C;
          text-decoration: none;
          margin: 0 4px;
        }

        .link:hover {
          text-decoration: underline;
        }

        /* Пустое состояние */
        .empty-state {
          padding: 40px 16px;
          text-align: center;
          color: #e0e6f0;
        }

        .empty-state .icon {
          font-size: 32px;
          margin-bottom: 16px;
          color: #a0aabe;
        }

        .empty-state .title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .empty-state .subtitle {
          font-size: 0.875rem;
          color: #a0aabe;
          margin: 0;
        }

        /* Лоадер */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 120px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #222d42;
          border-top: 2px solid #00B85C;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;