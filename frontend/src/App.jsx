import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PetDetail from './pages/PetDetail';
import MyPets from './pages/MyPets';
import CreatePet from './pages/CreatePet';
import Profile from './pages/Profile';
import PasswordReset from './pages/PasswordReset';

// Styles
import './styles/global.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/pet-detail.css';
import './styles/pages.css';
import './styles/filters.css';
import './styles/home.css';
import './styles/buttons.css';
import './styles/not-found.css';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/password-reset" element={<PasswordReset />} />
                    <Route path="/pets/:id" element={<PetDetail />} />

                    {/* Protected Routes */}
                    <Route
                        path="/mypets"
                        element={
                            <ProtectedRoute>
                                <MyPets />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create"
                        element={
                            <ProtectedRoute>
                                <CreatePet />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 Handler */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

export default App;