import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Home() {
    const [pets, setPets] = useState([])

    useEffect(() => {
        axios.get('/api/pets/')
            .then(response => setPets(response.data))
            .catch(error => console.error('Error fetching pets:', error))
    }, [])

    return (
        <div className='home'>
            <h1>Все объявления</h1>
            <div className='pets-list'>
                {pets.map(pet => (
                    <div key={pet.id} className='pet-card'>
                        <img src={pet.photo} alt={pet.name} />
                        <h3>{pet.name}</h3>
                        <p>{pet.description}</p>
                        <p>Цена: {pet.price}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home
