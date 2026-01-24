// frontend/src/components/YandexMetrika.jsx
import { useEffect } from 'react';

const YandexMetrika = () => {
  useEffect(() => {
    // Работаем ТОЛЬКО в продакшене
    if (import.meta.env.PROD) {
      // Проверяем, не загружен ли уже скрипт
      if (window.ym !== undefined) return;

      // Создаём скрипт с src
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js';

      // Инициализация после загрузки
      script.onload = () => {
        window.ym(106432339, 'init', {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true
        });
      };

      // Создаём noscript
      const noscript = document.createElement('noscript');
      noscript.innerHTML = '<div><img src="https://mc.yandex.ru/watch/106432339" style="position:absolute; left:-9999px;" alt="" /></div>';

      // Добавляем в head и body
      document.head.appendChild(script);
      document.body.appendChild(noscript);

      // Очистка
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        if (document.body.contains(noscript)) {
          document.body.removeChild(noscript);
        }
      };
    }
  }, []);

  return null;
};

export default YandexMetrika;