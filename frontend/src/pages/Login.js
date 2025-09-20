import React from 'react';
import AuthForm from '../components/AuthForm';

function Login() {
    return (
        <div className='login'>
            <h1>Вход в систему</h1>
            <AuthForm type='login' />
            <p>
                Не зарегистрированы?
                <a href='/register'>Зарегистрироваться</a>
            </p>
        </div>
    );
}

export default Login;
