// frontend/src/utils/date.js
export const formatRelativeDateTime = (date) => {
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Сегодня
  if (diffInDays === 0) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  // Вчера
  if (diffInDays === 1) {
    return `Вчера`;
  }
  // Эта неделя
  if (diffInDays < 7) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  }
  // Этот год
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }
  // Другой год
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};