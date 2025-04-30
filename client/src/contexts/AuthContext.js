// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Базовий URL для API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Створення контексту
const AuthContext = createContext();

// Hook для використання контексту авторизації
export const useAuth = () => useContext(AuthContext);

// Провайдер контексту
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Перевірка статусу авторизації при завантаженні
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Функція для перевірки статусу авторизації
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.isAuthenticated) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Помилка перевірки авторизації:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Реєстрація нового користувача
  const register = async (formData) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.errors[0]?.msg || 'Помилка реєстрації');
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Вхід користувача
  const login = async (username, password) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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
      
      return data;
    } catch (error) {
      console.error('Помилка авторизації:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Вихід користувача
  const logout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при виході');
      }
      
      setCurrentUser(null);
    } catch (error) {
      console.error('Помилка при виході:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Перевірка, чи авторизований користувач
  const isAuthenticated = !!currentUser;
  
  // Надання контексту
  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    isAuthenticated,
    checkAuthStatus
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;