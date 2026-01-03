// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ← ДОБАВЛЕН Navigate
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';

import Home from './pages/Home';
import PetDetail from './pages/PetDetail';
import CreatePet from './pages/CreatePet';
import EditPet from './pages/EditPet';
import Login from './pages/Login';
import Register from './pages/Register';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import AdminAds from './pages/AdminAds';
import CityPage from './pages/CityPage';

import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import Reviews from './pages/Reviews';

import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <div className="app">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* 🔥 РЕДИРЕКТ: /pets → / */}
              <Route path="/pets" element={<Navigate to="/" replace />} />

              {/* SEO-страницы */}
              <Route path="/:citySlug" element={<CityPage />} />
              <Route path="/:citySlug/:species" element={<CityPage />} />

              {/* Детали объявления */}
              <Route path="/pets/:id" element={<PetDetail />} />
              <Route path="/pets/:id/edit" element={
                <ProtectedRoute>
                  <EditPet />
                </ProtectedRoute>
              } />

              {/* Остальные страницы */}
              <Route path="/create" element={
                <ProtectedRoute>
                  <CreatePet />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/chat/:id" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/:id" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/reviews/user/:id" element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              } />
              <Route path="/forum" element={<Forum />} />
              <Route path="/admin/ads" element={
                <ProtectedRoute>
                  <AdminAds />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;