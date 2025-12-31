// frontend/src/components/Lightbox.jsx
import React, { useState, useEffect } from 'react';

const Lightbox = ({ src, alt, onClose, images = [], currentIndex = 0 }) => {
  const [current, setCurrent] = useState(currentIndex);
  const imageList = images.length > 0 ? images : [src];
  const [scrollPosition, setScrollPosition] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % imageList.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    setScrollPosition(window.pageYOffset);
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition);
    };
  }, [scrollPosition]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 10000, // ← повышенный z-index
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <button
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
        }}
        onClick={onClose}
      >
        &times;
      </button>

      {imageList.length > 1 && (
        <>
          <button
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            &lt;
          </button>
          <button
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            &gt;
          </button>
        </>
      )}

      <img
        src={imageList[current]}
        alt={alt}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default Lightbox;