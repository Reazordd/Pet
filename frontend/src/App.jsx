// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import AdminAds from './pages/AdminAds';
import CityPage from './pages/CityPage';

// 🔥 НОВЫЕ СТРАНИЦЫ
import ActivateAccount from './pages/ActivateAccount';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm';

import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import Reviews from './pages/Reviews';

// 🔥 ЮРИДИЧЕСКИЕ СТРАНИЦЫ
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// 🔥 НОВАЯ СТРАНИЦА КАТЕГОРИИ
import CategoryPage from './pages/CategoryPage';

import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="content flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* 🔥 РЕДИРЕКТ: /pets → / */}
              <Route path="/pets" element={<Navigate to="/" replace />} />

              {/* 🔥 НОВЫЕ МАРШРУТЫ */}
              <Route path="/activate/:uidb64/:token" element={<ActivateAccount />} />
              <Route path="/password-reset" element={<PasswordResetRequest />} />
              <Route path="/reset-password/:uidb64/:token" element={<PasswordResetConfirm />} />

              {/* SEO-страницы */}
              <Route path="/:citySlug" element={<CityPage />} />
              <Route path="/:citySlug/:species" element={<CityPage />} />

              {/* 🔥 СТРАНИЦА КАТЕГОРИИ */}
              <Route path="/category/:id" element={<CategoryPage />} />

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
              <Route path="/admin/ads" element={
                <ProtectedRoute>
                  <AdminAds />
                </ProtectedRoute>
              } />

              {/* 🔥 ЮРИДИЧЕСКИЕ СТРАНИЦЫ */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* FOOTER */}
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
              <a
                href="/terms"
                className="text-gray-600 hover:text-gray-900 hover:underline mr-4"
              >
                Пользовательское соглашение
              </a>
              <a
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 hover:underline mr-4"
              >
                Политика конфиденциальности
              </a>
              <span>© {new Date().getFullYear()} PetMarket</span>
            </div>
          </footer>

          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;