// frontend/src/components/Lightbox.jsx
import React from 'react';

const Lightbox = ({ src, alt, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="absolute top-4 right-4 text-white text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Lightbox;