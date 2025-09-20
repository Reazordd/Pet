import React, { useState } from 'react';
import axios from 'axios';

function ProfileForm() {
    const [user, setUser] = useState({});
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        axios.get('/api/profile/')
            .then(response => setUser(response.data))
            .catch(error => console.error('Ошибка загрузки профиля:', error));
    }, []);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('first_name', user.first_name);
            formData.append('last_name', user.last_name);
            formData.append('email', user.email);
            formData.append('phone', user.phone);
            formData.append('address', user.address);
            if (photo) formData.append('avatar', photo);

            await axios.put('/api/profile/', formData);
            alert('Профиль обновлен');
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='profile-form'>
            <div className='form-group'>
                <label>Фото профиля</label>
                <input
                    type='file'
                    accept='image/*'
                    onChange={handlePhotoChange}
                />
            </div>

            <div className='form-group'>
                <label>Имя</label>
                <input
                    type='text'
                    name='first_name'
                    value={user.first_name || ''}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Фамилия</label>
                <input
                    type='text'
                    name='last_name'
                    value={user.last_name || ''}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Email</label>
                <input
                    type='email'
                    name='email'
                    value={user.email || ''}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Телефон</label>
                <input
                    type='text'
                    name='phone'
                    value={user.phone || ''}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>Адрес</label>
                <textarea
                    name='address'
                    value={user.address || ''}
                    onChange={handleChange}
                />
            </div>

            <button type='submit'>Сохранить изменения</button>
        </form>
    );
}

export default ProfileForm;
