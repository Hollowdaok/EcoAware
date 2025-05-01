const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const GameResult = require('../models/GameResult');

// Маршрут для збереження результатів гри "Сортування сміття"
router.post('/trash-sorting/results', async (req, res) => {
  try {
    const { level, score, correct, incorrect, total, playTime } = req.body;
    
    // Перевірка чи користувач авторизований
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Для збереження результатів необхідно авторизуватися'
      });
    }
    
    // Отримання ID користувача з req.user (встановлюється middleware авторизації)
    const userId = req.user.id;
    
    // Створення ObjectId для userId
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (objIdError) {
      console.error('Помилка при створенні ObjectId:', objIdError);
      return res.status(400).json({
        success: false,
        message: 'Неправильний формат ID користувача'
      });
    }
    
    // Підготовка даних з правильними типами
    const gameData = {
      gameType: 'trash-sorting',
      userId: userObjectId,
      level: parseInt(level) || 1,
      score: parseInt(score) || 0,
      correct: parseInt(correct) || 0,
      incorrect: parseInt(incorrect) || 0,
      total: parseInt(total) || 0,
      playTime: parseInt(playTime) || 0
    };
    
    // Обчислюємо accuracy (якщо не буде обчислено в моделі)
    if (gameData.total > 0) {
      gameData.accuracy = Math.round((gameData.correct / gameData.total) * 100);
    } else {
      gameData.accuracy = 0;
    }
    
    // Створення нового запису результату гри
    const gameResult = new GameResult(gameData);
    
    // Зберігаємо результат
    await gameResult.save();
    
    // Відправляємо відповідь
    return res.status(201).json({ 
      success: true, 
      message: 'Результати збережено успішно', 
      result: gameResult
    });
  } catch (error) {
    console.error('Помилка при збереженні результатів гри:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Помилка при збереженні результатів',
      error: error.message 
    });
  }
});

// Отримання рейтингу (топ-10 кращих результатів)
router.get('/trash-sorting/leaderboard', async (req, res) => {
  try {
    const { level } = req.query;
    
    const query = { gameType: 'trash-sorting' };
    
    // Фільтрація за рівнем, якщо вказано
    if (level && level !== 'all') {
      query.level = parseInt(level);
    }
    
    // Отримання кращих результатів
    const leaderboard = await GameResult.find(query)
      .sort({ score: -1 })  // Сортування за спаданням очок
      .limit(10)  // Обмеження до 10 кращих результатів
      .select('score correct incorrect total accuracy playTime level createdAt')
      .populate('userId', 'username')  // Заповнення поля користувача, якщо є зв'язок з колекцією користувачів
      .lean();  // Перетворення результатів на прості JS об'єкти
    
    return res.json({ 
      success: true, 
      leaderboard
    });
  } catch (error) {
    console.error('Помилка при отриманні рейтингу:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Помилка при отриманні рейтингу',
      error: error.message 
    });
  }
});

// Отримання статистики користувача
router.get('/trash-sorting/stats', async (req, res) => {
  try {
    
    // Декодування токена вручну, якщо req.user відсутній але токен є
    if (!req.user && req.cookies.token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(
          req.cookies.token, 
          process.env.JWT_SECRET || 'ecoaware_secure_jwt_token_2024'
        );
        req.user = decoded;
      } catch (tokenError) {
        console.error('Помилка декодування токена в маршруті stats:', tokenError);
      }
    }
    
    // Перевірка на наявність авторизації
    if (!req.user) {
      
      // Відповідаємо з порожньою статистикою замість помилки 401
      return res.json({
        success: true,
        message: 'Статистика для неавторизованого користувача',
        stats: {
          totalGames: 0,
          totalScore: 0,
          correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
          levelStats: []
        }
      });
    }
    
    // Отримання ID користувача з req.user
    const userId = req.user.id;
    
    // Переконаємося, що модель GameResult доступна
    if (!GameResult || typeof GameResult.find !== 'function') {
      console.error('Модель GameResult недоступна або не має методу find');
      return res.json({
        success: true,
        message: 'Помилка доступу до моделі даних',
        stats: {
          totalGames: 0,
          totalScore: 0,
          correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
          levelStats: []
        }
      });
    }
    
    // Створення ObjectId для userId
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (objIdError) {
      console.error('Помилка при створенні ObjectId:', objIdError);
      
      // Спробуємо використати рядкове представлення ID
      try {
        // Рахуємо ігри без перетворення на ObjectId
        const countWithoutObjectId = await GameResult.countDocuments({ 
          gameType: 'trash-sorting', 
          userId: userId 
        });
        
        if (countWithoutObjectId > 0) {
          // Якщо знайдено ігри, продовжуємо з рядковим ID
          const allResults = await GameResult.find({
            gameType: 'trash-sorting',
            userId: userId
          }).lean();
          
          // Обчислення статистики
          // ... (решта коду функції)
        }
      } catch (secondaryError) {
        console.error('Помилка при альтернативному пошуку:', secondaryError);
      }
      
      // Повертаємо порожню статистику
      return res.json({
        success: true,
        message: 'Проблема з ідентифікатором користувача',
        stats: {
          totalGames: 0,
          totalScore: 0,
          correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
          levelStats: []
        }
      });
    }
    
    // Загальна статистика
    const totalGames = await GameResult.countDocuments({ 
      gameType: 'trash-sorting', 
      userId: userObjectId 
    });
    
    // Якщо користувач не грав жодної гри
    if (totalGames === 0) {
      return res.json({
        success: true,
        stats: {
          totalGames: 0,
          totalScore: 0,
          correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
          levelStats: []
        }
      });
    }
    
    // Отримання всіх результатів для обчислення статистики вручну
    const allResults = await GameResult.find({
      gameType: 'trash-sorting',
      userId: userObjectId
    }).lean();
    
    // Обчислення загальної статистики
    let totalScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalItems = 0;
    
    const levelMap = new Map();
    
    // Обробка результатів
    allResults.forEach(result => {
      // Загальна статистика
      totalScore += result.score || 0;
      totalCorrect += result.correct || 0;
      totalIncorrect += result.incorrect || 0;
      totalItems += result.total || 0;
      
      // Статистика за рівнями
      const level = result.level || 1;
      if (!levelMap.has(level)) {
        levelMap.set(level, {
          level,
          gamesPlayed: 0,
          totalScore: 0,
          maxScore: 0,
          totalPlayTime: 0
        });
      }
      
      const levelStat = levelMap.get(level);
      levelStat.gamesPlayed += 1;
      levelStat.totalScore += result.score || 0;
      levelStat.maxScore = Math.max(levelStat.maxScore, result.score || 0);
      levelStat.totalPlayTime += result.playTime || 0;
    });
    
    // Перетворення Map на масив
    const levelStats = Array.from(levelMap.values()).map(levelStat => ({
      level: levelStat.level,
      gamesPlayed: levelStat.gamesPlayed,
      avgScore: Math.round(levelStat.totalScore / levelStat.gamesPlayed),
      maxScore: levelStat.maxScore,
      totalPlayTime: levelStat.totalPlayTime,
      avgPlayTime: Math.round(levelStat.totalPlayTime / levelStat.gamesPlayed)
    })).sort((a, b) => a.level - b.level);
    
    // Формування відповіді
    const stats = {
      totalGames,
      totalScore,
      correctIncorrect: {
        correct: totalCorrect,
        incorrect: totalIncorrect,
        total: totalItems,
        accuracy: totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0
      },
      levelStats
    };
    
    return res.json({ success: true, stats });
  } catch (error) {
    console.error('Помилка при отриманні статистики:', error);
    
    // Повертаємо порожню статистику замість помилки 500
    return res.json({ 
      success: true, 
      message: 'Виникла помилка при отриманні статистики',
      stats: {
        totalGames: 0,
        totalScore: 0,
        correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
        levelStats: []
      }
    });
  }
});

// Отримання рекомендацій на основі результатів гри
router.get('/trash-sorting/recommendations', async (req, res) => {
  try {
    // Перевірка чи користувач авторизований
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Для отримання рекомендацій необхідно авторизуватися'
      });
    }
    
    // Отримання ID користувача з req.user
    const userId = req.user.id;
    
    // Створення ObjectId для userId
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (objIdError) {
      console.error('Помилка при створенні ObjectId:', objIdError);
      return res.status(400).json({
        success: false,
        message: 'Неправильний формат ID користувача'
      });
    }
    
    // Отримання останніх результатів гри
    const latestResults = await GameResult.find({ 
      gameType: 'trash-sorting', 
      userId: userObjectId 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Аналіз слабких місць у сортуванні
    const recommendations = {
      improvementAreas: [],
      generalTips: [
        'Пам\'ятайте, що папір і картон завжди підлягають переробці, якщо не забруднені їжею',
        'Пластикові пляшки слід сплющувати перед викиданням для економії місця',
        'Органічні відходи можна компостувати у спеціальних контейнерах',
        'Скляні пляшки різних кольорів слід сортувати окремо'
      ]
    };
    
    // Приклад логіки для визначення областей для покращення
    if (latestResults.length > 0) {
      let totalAccuracy = 0;
      latestResults.forEach(result => {
        const accuracy = result.total > 0 ? (result.correct / result.total) * 100 : 0;
        totalAccuracy += accuracy;
      });
      
      const averageAccuracy = totalAccuracy / latestResults.length;
      
      if (averageAccuracy < 60) {
        recommendations.improvementAreas.push({
          area: 'Загальні знання про сортування',
          tip: 'Перегляньте основні правила сортування відходів у вашому місті'
        });
      }
    }
    
    return res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Помилка при отриманні рекомендацій:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Помилка при отриманні рекомендацій',
      error: error.message 
    });
  }
});

module.exports = router;