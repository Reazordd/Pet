import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PetDetail from "./pages/PetDetail";
import MyPets from "./pages/MyPets";
import CreatePet from "./pages/CreatePet";
import Profile from "./pages/Profile";
import PasswordReset from "./pages/PasswordReset";
import Messages from "./pages/Messages";
import ChatRoom from "./pages/ChatRoom";
import SellerProfile from "./pages/SellerProfile";
import PetsList from "./pages/PetsList";
import FavoritesPage from "./pages/FavoritesPage";
import Forum from "./pages/Forum";

import { FavoritesProvider } from "./context/FavoritesContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/global.css";

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <div className="app">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pets" element={<PetsList />} />
              <Route path="/pets/:id" element={<PetDetail />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset" element={<PasswordReset />} />

              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <ChatRoom />
                  </ProtectedRoute>
                }
              />

              <Route path="/seller/:id" element={<SellerProfile />} />

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

              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />

              {/* Форум */}
              <Route path="/forum" element={<Forum />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <ToastContainer position="top-right" autoClose={4000} />
        </div>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
