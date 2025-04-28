// src/App.js (оновлений з маршрутами авторизації)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './pages/Home';
import EcoKnowledge from './pages/EcoKnowledge';
import ArticleDetail from './pages/ArticleDetail';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import EcoGames from './pages/EcoGames';
import TrashSortingGamePage from './pages/TrashSortingGame';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';

// Компонент контексту для авторизації
import { AuthProvider } from './contexts/AuthContext';

// Захищений маршрут
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Помилка перевірки авторизації:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  if (loading) {
    // Можна додати компонент завантаження
    return <div>Завантаження...</div>;
  }
  
  if (!isAuthenticated) {
    // Перенаправлення на сторінку входу з шляхом повернення
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?redirect=${currentPath}`} replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/knowledge" element={<EcoKnowledge />} />
          <Route path="/knowledge/article/:id" element={<ArticleDetail />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/:id" element={<TestDetail />} />
          <Route path="/games" element={<EcoGames />} />
          <Route path="/games/trash-sorting" element={<TrashSortingGamePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Захищені маршрути */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <div>Сторінка профілю користувача</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;