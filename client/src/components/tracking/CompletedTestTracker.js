// src/components/tracking/CompletedTestTracker.js
import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// API URL
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
        console.log('🔄 Пропускаємо повторне відстеження тесту:', testId);
        return;
      }
      
      console.log('🔍 CompletedTestTracker викликано для тесту:', { testId, title, category, score });
      console.log('🔑 Статус авторизації:', { isAuthenticated, userId: currentUser?.id });
      
      if (!isAuthenticated || !testId) {
        console.log('❌ Пропускаємо відстеження: користувач не авторизований або відсутній ID тесту');
        return;
      }
      
      try {
        // Позначаємо, що тест уже відстежено, перед відправкою запиту
        isTrackedRef.current = true;
        
        console.log('📤 Відправляємо запит на відстеження тесту:', `${API_URL}/tests/track-completion`);
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
        
        const data = await response.json();
        console.log('✅ Результати тесту успішно зареєстровано:', data);
      } catch (error) {
        console.error('❌ Помилка при збереженні результатів тесту:', error);
      }
    };
    
    trackTestCompletion();
  }, [testId, isAuthenticated, currentUser]); // Залежності мінімізовані
  
  return null;
};

export default CompletedTestTracker;