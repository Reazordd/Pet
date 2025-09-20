import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

function PetDetail() {
    const { id } = useParams()
    const [pet, setPet] = useState(null)

    useEffect(() => {
        axios.get(`/api/pets/${id}`)
            .then(response => setPet(response.data))
            .catch(error => console.error('Error fetching pet:', error))
    }, [id])

    if (!pet) {
        return <div>Загрузка...</div>
    }

    return (
        <div className='pet-detail'>
            <h1>{pet.name}</h1>
            <img src={pet.photo} alt={pet.name} className='pet-photo' />
            <p><strong>Категория:</strong> {pet.category.name}</p>
            <p><strong>Порода:</strong> {pet.breed}</p>
            <p><strong>Возраст:</strong> {pet.age} лет</p>
            <p><strong>Цена:</strong> {pet.price} руб.</p>
            <div className='description'>
                <h2>Описание</h2>
                <p>{pet.description}</p>
            </div>
        </div>
    )
}

export default PetDetail
