// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Створення контексту авторизації
const AuthContext = createContext();

// Hook для зручного використання контексту авторизації
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Функція для авторизації
  const login = async (username, password) => {
    try {
      const response = await fetch('localhost:5000/ai/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка авторизації');
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      setAuthenticated(true);
      return data;
    } catch (error) {
      console.error('Помилка авторизації:', error);
      throw error;
    }
  };
  
  // Функція для реєстрації
  const register = async (userData) => {
    try {
      const response = await fetch('localhost:5000/ai/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors 
            ? errorData.errors.map(err => err.msg).join(', ') 
            : (errorData.message || 'Помилка реєстрації')
        );
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      setAuthenticated(true);
      return data;
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      throw error;
    }
  };
  
  // Функція для виходу
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setCurrentUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };
  
  // Перевірка статусу авторизації при завантаженні
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setCurrentUser(data.user);
          setAuthenticated(true);
        } else {
          setCurrentUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Помилка перевірки авторизації:', error);
        setCurrentUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Функція для отримання додаткової інформації про користувача
  const getUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Не вдалося отримати дані профілю');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
      }
      
      return data.user;
    } catch (error) {
      console.error('Помилка отримання профілю:', error);
      throw error;
    }
  };
  
  // Функція для оновлення профілю користувача
  const updateUserProfile = async (userData) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors 
            ? errorData.errors.map(err => err.msg).join(', ') 
            : (errorData.message || 'Помилка оновлення профілю')
        );
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      throw error;
    }
  };
  
  // Значення контексту
  const value = {
    currentUser,
    authenticated,
    loading,
    login,
    register,
    logout,
    getUserProfile,
    updateUserProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;