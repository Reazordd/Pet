// frontend/src/components/ImageUploader.jsx
import React from 'react';

function ImageUploader({ images, onChange, maxCount = 5 }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > maxCount) {
      alert(`Можно загрузить максимум ${maxCount} фото`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Файл "${file.name}" больше 5 МБ и будет пропущен.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`Файл "${file.name}" не является изображением.`);
        return false;
      }
      return true;
    });

    onChange([...images, ...validFiles]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Фотографии (максимум {maxCount})
      </label>
      <div className="flex flex-wrap gap-2">
        {images.map((file, index) => (
          <div
            key={index + 'preview'}
            className="relative"
            style={{ width: '80px', height: '80px' }}
          >
            <img
              src={typeof file === 'string' ? file : URL.createObjectURL(file)}
              alt={`Фото ${index + 1}`}
              className="w-full h-full object-cover border rounded"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
            >
              ×
            </button>
          </div>
        ))}

        {Array.from({ length: maxCount - images.length }).map((_, i) => (
          <div
            key={'placeholder-' + i}
            className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded"
            style={{ width: '80px', height: '80px' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mt-2"
      />
      <p className="text-xs text-gray-500 mt-1">
        Поддерживаются JPG, PNG. Макс. размер файла — 5 МБ.
      </p>
    </div>
  );
}

export default ImageUploader;