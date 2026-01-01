// frontend/src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

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

  // 🔥 НОВОЕ: Удаление одного уведомления
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/delete/${id}/`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      toast.error('Не удалось удалить уведомление');
    }
  };

  // 🔥 НОВОЕ: Удаление всех уведомлений
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

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="notifications-page max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <div className="flex gap-3">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:underline text-sm"
            >
              Отметить всё как прочитанное
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Очистить всё
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">Нет уведомлений</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 border rounded-lg relative ${
                n.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              {/* 🔥 Кнопка удаления */}
              <button
                onClick={() => deleteNotification(n.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                aria-label="Удалить уведомление"
              >
                &times;
              </button>

              <div className="pr-6">
                <p>
                  <strong>{n.actor?.username || 'Система'}</strong> {n.description || n.get_verb_display()}
                </p>
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-sm text-blue-600 hover:underline mt-1"
                  >
                    Прочитано
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(n.created_at).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;