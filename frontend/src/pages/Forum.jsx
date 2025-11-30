// frontend/src/pages/Forum.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../styles/Forum.css';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/forum/');
      // 🔥 Проверяем формат данных
      let data = response.data;
      if (data.results) {
        data = data.results;
      }
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
        toast.error('Данные форума пришли в неверном формате');
      }
    } catch (err) {
      console.error('Ошибка при загрузке постов:', err);
      toast.error('Ошибка при загрузке постов');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-wrapper">
      <h1>Форум</h1>
      <div className="forum-content">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="post-card">
              <Skeleton height={20} />
              <Skeleton count={3} />
            </div>
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>
                <Link to={`/forum/${post.id}`}>{post.title}</Link>
              </h3>
              {/* 🔥 Исправлено: выводим username, а не объект */}
              <p>Автор: {post.author?.username || 'Неизвестный'}</p>
              <p>{post.content}</p>
              <div className="post-meta">
                <span>Дата: {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <Link to={`/forum/${post.id}`}>Читать далее</Link>
            </div>
          ))
        ) : (
          <div className="no-results">
            <h3>Нет постов</h3>
            <p>Пока что никто не писал в форум.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Forum;