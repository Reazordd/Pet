// frontend/src/components/CategoryStrip.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'dog', name: 'Собаки', icon: '🐶' },
  { id: 'cat', name: 'Кошки', icon: '🐱' },
  { id: 'bird', name: 'Птицы', icon: '🦜' },
  { id: 'rodent', name: 'Грызуны', icon: '🐹' },
  { id: 'fish', name: 'Рыбы', icon: '🐠' },
  { id: 'reptile', name: 'Рептилии', icon: '🦎' },
  { id: 'other', name: 'Другое', icon: '🐾' },
];

export default function CategoryStrip() {
  return (
    <div className="category-strip">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          to={`/category/${cat.id}`}
          className="category-item"
        >
          <span className="category-icon">{cat.icon}</span>
          <span className="category-name">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}