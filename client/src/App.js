import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './pages/Home';
import EcoKnowledge from './pages/EcoKnowledge';
import ArticleDetail from './pages/ArticleDetail';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import TrashSortingGamePage from './pages/TrashSortingGame';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Footer from './components/Footer';

// Компонент контексту для авторизації
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Захищений маршрут
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // Показуємо компонент завантаження, поки перевіряємо статус авторизації
    return <div className="text-center py-5">Завантаження...</div>;
  }
  
  if (!isAuthenticated) {
    // Перенаправлення на сторінку входу з шляхом повернення
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?redirect=${currentPath}`} replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/knowledge" element={<EcoKnowledge />} />
      <Route path="/knowledge/article/:id" element={<ArticleDetail />} />
      <Route path="/tests" element={<Tests />} />
      <Route path="/tests/:id" element={<TestDetail />} />
      <Route path="/games/trash-sorting" element={<TrashSortingGamePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Захищений маршрут до профілю */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <AppRoutes />
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;