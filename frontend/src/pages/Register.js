import React from 'react';
import AuthForm from '../components/AuthForm';

function Register() {
    return (
        <div className='register'>
            <h1>Регистрация</h1>
            <AuthForm type='register' />
            <p>
                Уже есть аккаунт?
                <a href='/login'>Войти</a>
            </p>
        </div>
    );
}

export default Register;  // Добавьте экспорт


