// server/models/GameResult.js
const mongoose = require('mongoose');

const GameResultSchema = new mongoose.Schema({
  gameType: {
    type: String,
    required: true,
    default: 'trash-sorting'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // Можна використовувати null для анонімних користувачів
  },
  level: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  correct: {
    type: Number,
    required: true
  },
  incorrect: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    default: function() {
      return this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0;
    }
  },
  playTime: {
    type: Number,  // Час у секундах
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameResult', GameResultSchema);

// server/routes/games.js
const express = require('express');
const router = express.Router();
const GameResult = require('../models/GameResult');

// Маршрут для збереження результатів гри "Сортування сміття"
router.post('/trash-sorting/results', async (req, res) => {
  try {
    const { level, score, correct, incorrect, total, playTime } = req.body;
    
    // Отримання ID користувача з сесії (якщо користувач автентифікований)
    const userId = req.session && req.session.userId ? req.session.userId : null;
    
    // Створення нового запису результату гри
    const gameResult = new GameResult({
      gameType: 'trash-sorting',
      userId,
      level,
      score,
      correct,
      incorrect,
      total,
      playTime
    });
    
    await gameResult.save();
    res.status(201).json({ success: true, message: 'Результати збережено успішно', result: gameResult });
  } catch (error) {
    console.error('Помилка при збереженні результатів гри:', error);
    res.status(500).json({ success: false, message: 'Помилка при збереженні результатів' });
  }
});

// Отримання рейтингу (топ-10 кращих результатів)
router.get('/trash-sorting/leaderboard', async (req, res) => {
  try {
    const { level } = req.query;
    
    const query = { gameType: 'trash-sorting' };
    
    // Фільтрація за рівнем, якщо вказано
    if (level) {
      query.level = parseInt(level);
    }
    
    // Отримання кращих результатів
    const leaderboard = await GameResult.find(query)
      .sort({ score: -1 })  // Сортування за спаданням очок
      .limit(10)  // Обмеження до 10 кращих результатів
      .select('score correct incorrect total accuracy playTime level createdAt')
      .populate('userId', 'username')  // Заповнення поля користувача, якщо є зв'язок з колекцією користувачів
      .lean();  // Перетворення результатів на прості JS об'єкти
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Помилка при отриманні рейтингу:', error);
    res.status(500).json({ success: false, message: 'Помилка при отриманні рейтингу' });
  }
});

// Отримання статистики користувача
router.get('/trash-sorting/stats', async (req, res) => {
  try {
    // Отримання ID користувача з сесії (якщо користувач автентифікований)
    const userId = req.session && req.session.userId ? req.session.userId : null;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Користувач не автентифікований' });
    }
    
    // Загальна статистика
    const totalGames = await GameResult.countDocuments({ gameType: 'trash-sorting', userId });
    const totalScore = await GameResult.aggregate([
      { $match: { gameType: 'trash-sorting', userId } },
      { $group: { _id: null, total: { $sum: '$score' } } }
    ]);
    
    // Статистика правильних/неправильних відповідей
    const correctIncorrectStats = await GameResult.aggregate([
      { $match: { gameType: 'trash-sorting', userId } },
      { $group: { 
        _id: null, 
        totalCorrect: { $sum: '$correct' },
        totalIncorrect: { $sum: '$incorrect' },
        totalItems: { $sum: '$total' }
      } }
    ]);
    
    // Статистика за рівнями
    const levelStats = await GameResult.aggregate([
      { $match: { gameType: 'trash-sorting', userId } },
      { $group: { 
        _id: '$level', 
        gamesPlayed: { $sum: 1 },
        avgScore: { $avg: '$score' },
        maxScore: { $max: '$score' },
        totalPlayTime: { $sum: '$playTime' }
      } },
      { $sort: { _id: 1 } }
    ]);
    
    const stats = {
      totalGames,
      totalScore: totalScore.length > 0 ? totalScore[0].total : 0,
      correctIncorrect: correctIncorrectStats.length > 0 ? {
        correct: correctIncorrectStats[0].totalCorrect,
        incorrect: correctIncorrectStats[0].totalIncorrect,
        total: correctIncorrectStats[0].totalItems,
        accuracy: correctIncorrectStats[0].totalItems > 0 
          ? Math.round((correctIncorrectStats[0].totalCorrect / correctIncorrectStats[0].totalItems) * 100) 
          : 0
      } : { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
      levelStats: levelStats.map(level => ({
        level: level._id,
        gamesPlayed: level.gamesPlayed,
        avgScore: Math.round(level.avgScore),
        maxScore: level.maxScore,
        totalPlayTime: level.totalPlayTime,
        avgPlayTime: Math.round(level.totalPlayTime / level.gamesPlayed)
      }))
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Помилка при отриманні статистики:', error);
    res.status(500).json({ success: false, message: 'Помилка при отриманні статистики' });
  }
});

// Отримання рекомендацій на основі результатів гри
router.get('/trash-sorting/recommendations', async (req, res) => {
  try {
    const userId = req.session && req.session.userId ? req.session.userId : null;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Користувач не автентифікований' });
    }
    
    // Отримання останніх результатів гри
    const latestResults = await GameResult.find({ gameType: 'trash-sorting', userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
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
      const averageAccuracy = latestResults.reduce((sum, result) => sum + 
        (result.total > 0 ? (result.correct / result.total) * 100 : 0), 0) / latestResults.length;
      
      if (averageAccuracy < 60) {
        recommendations.improvementAreas.push({
          area: 'Загальні знання про сортування',
          tip: 'Перегляньте основні правила сортування відходів у вашому місті'
        });
      }
      
      // Тут можна додати більше логіки для аналізу результатів
    }
    
    res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Помилка при отриманні рекомендацій:', error);
    res.status(500).json({ success: false, message: 'Помилка при отриманні рекомендацій' });
  }
});

module.exports = router;