import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import PetDetail from './pages/PetDetail';
import MyPets from './pages/MyPets';
import Navbar from './components/Navbar';
import CreatePet from './pages/CreatePet';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import PasswordReset from './pages/PasswordReset';
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <div className='app'>
                <Navbar />
                <main className='content'>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/pets/:id' element={<PetDetail />} />
                        <Route
                            path='/mypets'
                            element={<ProtectedRoute component={MyPets} />}
                        />
                        <Route
                            path='/create'
                            element={<ProtectedRoute component={CreatePet} />}
                        />
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<Register />} />
                        <Route path='/password-reset' element={<PasswordReset />} />
                        <Route path='/profile' element={<ProtectedRoute component={Profile} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;



