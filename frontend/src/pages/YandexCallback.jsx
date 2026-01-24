// frontend/src/pages/YandexCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function YandexCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      api.post('/auth/yandex/callback/', { code })
        .then(res => {
          localStorage.setItem('access_token', res.data.access);
          localStorage.setItem('refresh_token', res.data.refresh);
          toast.success('✅ Вход через Яндекс выполнен!');
          navigate('/profile');
        })
        .catch(err => {
          console.error('Yandex login error:', err);
          toast.error('Ошибка входа через Яндекс');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <p className="text-center mt-10">Обработка входа через Яндекс...</p>;
}