import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Компонент для відстеження пройдених тестів
 */
const CompletedTestTracker = ({ 
  testId, 
  title,
  category,
  score,
  correctAnswers,
  totalQuestions
}) => {
  const { isAuthenticated, currentUser } = useAuth();
  // Використовуємо useRef для відстеження, чи була вже відправлена інформація
  const isTrackedRef = useRef(false);
  
  useEffect(() => {
    const trackTestCompletion = async () => {
      // Перевіряємо, чи тест був вже відстежений для цієї сесії
      if (isTrackedRef.current) {
        return;
      }
      
      if (!isAuthenticated || !testId) {
        return;
      }
      
      try {
        isTrackedRef.current = true;
        
        const response = await fetch(`${API_URL}/tests/track-completion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            testId,
            title,
            category,
            score,
            correctAnswers,
            totalQuestions,
            timestamp: new Date().toISOString() // Додаємо часову мітку для ідентифікації дублікатів
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Помилка відстеження');
        }
        
        // Отримуємо дані відповіді, але не використовуємо їх
        await response.json();
      } catch (error) {
        console.error('❌ Помилка при збереженні результатів тесту:', error);
      }
    };
    
    trackTestCompletion();
  }, [
    testId,
    isAuthenticated, 
    currentUser,
    title,
    category,
    score,
    correctAnswers,
    totalQuestions
  ]);
  
  return null;
};

export default CompletedTestTracker;