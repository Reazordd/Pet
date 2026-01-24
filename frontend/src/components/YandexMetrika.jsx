// frontend/src/components/YandexMetrika.jsx
import { useEffect } from 'react';

const YandexMetrika = () => {
  useEffect(() => {
    // Работаем ТОЛЬКО в продакшене
    if (import.meta.env.PROD) {
      // Проверяем, не загружен ли уже скрипт
      if (window.ym !== undefined) return;

      // Создаём скрипт Метрики
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        
        ym(106432339, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:true
        });
      `;

      // Создаём noscript для пользователей без JS
      const noscript = document.createElement('noscript');
      noscript.innerHTML = '<div><img src="https://mc.yandex.ru/watch/106432339" style="position:absolute; left:-9999px;" alt="" /></div>';

      // Добавляем в head и body
      document.head.appendChild(script);
      document.body.appendChild(noscript);

      // Очистка при размонтировании
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