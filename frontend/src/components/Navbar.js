import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className='navbar'>
            <div className='logo'>
                <Link to='/' className='logo-link'>
                    Объявления о животных
                </Link>
            </div>
            <ul className='nav-links'>
                <li>
                    <Link to='/' className='nav-link'>
                        Главная
                    </Link>
                </li>
                <li>
                    <Link to='/mypets' className='nav-link'>
                        Мои объявления
                    </Link>
                </li>
                <li>
                    <Link to='/profile' className='nav-link'>
                        Мой профиль
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;

