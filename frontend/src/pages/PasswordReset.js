import React from 'react';
import PasswordResetForm from '../components/PasswordResetForm';

function PasswordReset() {
    return (
        <div className='password-reset'>
            <h1>Восстановление пароля</h1>
            <PasswordResetForm />
            <p>
                Вернуться к{' '}
                <a href='/login'>входу</a>
            </p>
        </div>
    );
}

export default PasswordReset;
