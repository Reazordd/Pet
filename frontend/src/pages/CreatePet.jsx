import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

function CreatePet() {
    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        age: '',
        description: '',
        price: '',
        category: '',
        photo: null
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data.results || response.data);
        } catch (error) {
            toast.error('Ошибка при загрузке категорий');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            await api.post('/pets/', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.success('Объявление успешно создано!');
            navigate('/mypets');
        } catch (error) {
            if (error.response?.data) {
                Object.values(error.response.data).forEach(errors => {
                    if (Array.isArray(errors)) {
                        errors.forEach(err => toast.error(err));
                    }
                });
            } else {
                toast.error('Ошибка при создании объявления');
            }
        } finally {
            setLoading(false);
        }
    };

    const breedOptions = [
        { value: 'dog', label: 'Собака' },
        { value: 'cat', label: 'Кошка' },
        { value: 'bird', label: 'Птица' },
        { value: 'fish', label: 'Рыба' },
        { value: 'rodent', label: 'Грызун' },
        { value: 'reptile', label: 'Рептилия' },
        { value: 'other', label: 'Другое животное' }
    ];

    return (
        <div className="create-pet">
            <div className="page-header">
                <h1>Создать объявление</h1>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="pet-form">
                    <div className="form-section">
                        <h3>Основная информация</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Имя животного *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Например: Барсик"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="age">Возраст (лет) *</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    disabled={loading}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="breed">Вид животного *</label>
                                <select
                                    id="breed"
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Выберите вид</option>
                                    {breedOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Категория</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="">Выберите категорию</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Цена (₽)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                disabled={loading}
                                placeholder="0.00"
                            />
                            <small>Оставьте пустым, если цена договорная</small>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Описание</h3>
                        <div className="form-group">
                            <label htmlFor="description">Описание *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Опишите ваше животное: порода, характер, привычки, особенности ухода..."
                                rows="5"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Фотография</h3>
                        <div className="form-group">
                            <label htmlFor="photo">Фото животного</label>
                            <input
                                type="file"
                                id="photo"
                                name="photo"
                                onChange={handleFileChange}
                                disabled={loading}
                                accept="image/*"
                            />

                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            )}

                            <small>Рекомендуется добавлять качественные фотографии</small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary btn-large"
                            disabled={loading}
                        >
                            {loading ? 'Создание...' : '📝 Создать объявление'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/mypets')}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePet;