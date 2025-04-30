// src/components/games/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Form, Alert } from 'react-bootstrap';
import './Leaderboard.css';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  // Завантаження даних таблиці рекордів
  useEffect(() => {
    fetchLeaderboard();
  }, [selectedLevel]);
  
  // Отримання даних з сервера
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = selectedLevel === 'all' 
        ? `${API_URL}/games/trash-sorting/leaderboard`
        : `${API_URL}/games/trash-sorting/leaderboard?level=${selectedLevel}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Помилка завантаження таблиці рекордів');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setError('Не вдалося отримати дані рейтингу');
      }
    } catch (err) {
      console.error('Помилка при завантаженні таблиці рекордів:', err);
      setError('Помилка завантаження даних. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };
  
  // Обробник зміни рівня для фільтрації
  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };
  
  // Функція для форматування дати
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Відображення бейджа складності відповідно до рівня
  const renderDifficultyBadge = (level) => {
    let variant = 'success';
    let text = 'Легкий';
    
    if (level === 2) {
      variant = 'warning';
      text = 'Середній';
    } else if (level === 3) {
      variant = 'danger';
      text = 'Складний';
    }
    
    return <Badge bg={variant}>{text}</Badge>;
  };
  
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3>Таблиця рекордів</h3>
        <div className="filter-controls">
          <Form.Group>
            <Form.Label>Рівень складності:</Form.Label>
            <Form.Select 
              size="sm"
              value={selectedLevel}
              onChange={handleLevelChange}
            >
              <option value="all">Всі рівні</option>
              <option value="1">Легкий</option>
              <option value="2">Середній</option>
              <option value="3">Складний</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Завантаження рейтингу...</p>
        </div>
      ) : (
        <>
          {leaderboard.length === 0 ? (
            <Alert variant="info" className="mt-3">
              Поки що немає результатів для відображення. Ви можете бути першим!
            </Alert>
          ) : (
            <Table striped hover responsive className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Гравець</th>
                  <th>Очки</th>
                  <th>Рівень</th>
                  <th>Точність</th>
                  <th>Правильно</th>
                  <th>Час гри</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((result, index) => (
                  <tr key={index} className={index < 3 ? `top-${index + 1}` : ''}>
                    <td>{index + 1}</td>
                    <td>
                      {result.userId && result.userId.username ? (
                        result.userId.username
                      ) : (
                        <span className="text-muted">Анонім</span>
                      )}
                      {index < 3 && (
                        <span className={`trophy trophy-${index + 1}`}>
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </td>
                    <td className="score">{result.score}</td>
                    <td>{renderDifficultyBadge(result.level)}</td>
                    <td>{result.accuracy || 0}%</td>
                    <td>
                      {result.correct}/{result.total}
                    </td>
                    <td>{Math.floor(result.playTime / 60)}:{(result.playTime % 60).toString().padStart(2, '0')}</td>
                    <td>{formatDate(result.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;