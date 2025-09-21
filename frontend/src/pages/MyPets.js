import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MyPets() {
    const [pets, setPets] = useState([]);

    useEffect(() => {
        axios.get('/api/pets/my_pets/')
            .then(response => setPets(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div className='my-pets'>
            <h1>Мои объявления</h1>
            <Link to='/create' className='btn btn-primary'>
                Создать новое объявление
            </Link>
            <div className='pets-list'>
                {pets.map(pet => (
                    <div key={pet.id} className='pet-card'>
                        <img src={pet.photo} alt={pet.name} />
                        <h3>{pet.name}</h3>
                        <p>{pet.breed} • {pet.age} лет</p>
                        <p>Цена: {pet.price} руб.</p>
                        <Link to={`/pets/${pet.id}/edit`}>Редактировать</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyPets;