// src/components/tracking/ViewedArticleTracker.js
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Компонент для відстеження переглянутих статей
 */
const ViewedArticleTracker = ({ articleId, title, category }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  useEffect(() => {
    const trackArticleView = async () => {
      console.log('🔍 ViewedArticleTracker викликано для статті:', { articleId, title, category });
      console.log('🔑 Статус авторизації:', { isAuthenticated, userId: currentUser?.id });
      
      if (!isAuthenticated || !articleId) {
        console.log('❌ Пропускаємо відстеження: користувач не авторизований або відсутній ID статті');
        return;
      }
      
      try {
        console.log('📤 Відправляємо запит на відстеження статті:', `${API_URL}/articles/track-view`);
        const response = await fetch(`${API_URL}/articles/track-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            articleId,
            title,
            category
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Помилка відстеження');
        }
        
        const data = await response.json();
        console.log('✅ Перегляд статті успішно зареєстровано:', data);
      } catch (error) {
        console.error('❌ Помилка при збереженні перегляду статті:', error);
      }
    };
    
    // Виконуємо відстеження при першому рендері компонента
    trackArticleView();
    
    // Відстежуємо лише при першому рендері, коли компонент монтується
  }, [articleId, title, category, isAuthenticated, currentUser]);
  
  // Компонент не рендерить нічого, він просто відстежує
  return null;
};

export default ViewedArticleTracker;