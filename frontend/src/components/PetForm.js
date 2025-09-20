import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function PetForm({ pet = null, onSuccess }) {
    const history = useHistory();
    const [formData, setFormData] = useState({
        id: pet?.id || '',
        name: pet?.name || '',
        category: pet?.category || '',
        breed: pet?.breed || '',
        age: pet?.age || '',
        description: pet?.description || '',
        price: pet?.price || '',
        photo: null
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Загружаем категории при монтировании компонента
        axios.get('/api/categories/')
            .then(response => setCategories(response.data))
            .catch(error => console.error('Ошибка загрузки категорий:', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            photo: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', formData.name);
            formData.append('category', formData.category);
            formData.append('breed', formData.breed);
            formData.append('age', formData.age);
            formData.append('description', formData.description);
            formData.append('price', formData.price);
            formData.append('photo', formData.photo);

            if (pet) {
                // Обновление существующего объявления
                await axios.put(`/api/pets/${pet.id}/`, formData);
            } else {
                // Создание нового объявления
                await axios.post('/api/pets/', formData);
            }

            if (onSuccess) {
                onSuccess();
            }
            history.push('/');
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='pet-form'>
            <div className='form-group'>
                <label>Название</label>
                <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className='form-group'>
                <label>Категория</label>
                <select
                    name='category'
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    <option value=''>Выберите категорию</option>
                    {categories?.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className='form-group'>
                <label>Порода</label>
                <input
                    type='text'
                    name='breed'
                    value={formData.breed}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Возраст</label>
                <input
                    type='number'
                    name='age'
                    value={formData.age}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Описание</label>
                <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Цена</label>
                <input
                    type='number'
                    name='price'
                    value={formData.price}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Фото</label>
                <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                />
            </div>

            <button type='submit'>
                {pet ? 'Сохранить' : 'Создать'}
            </button>
        </form>
    );
}

export default PetForm;

