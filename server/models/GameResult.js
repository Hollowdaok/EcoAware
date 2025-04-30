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
    required: true,
    default: 1
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  correct: {
    type: Number,
    required: true,
    default: 0
  },
  incorrect: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  accuracy: {
    type: Number,
    default: function() {
      return this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0;
    }
  },
  playTime: {
    type: Number,  // Час у секундах
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Додаємо валідацію перед збереженням для уникнення порожніх значень
GameResultSchema.pre('save', function(next) {
  // Переконуємося, що числові поля завжди мають значення
  this.level = this.level || 1;
  this.score = this.score || 0;
  this.correct = this.correct || 0;
  this.incorrect = this.incorrect || 0;
  this.total = this.total || 0;
  this.playTime = this.playTime || 0;
  
  // Переобчислюємо accuracy
  if (this.total > 0) {
    this.accuracy = Math.round((this.correct / this.total) * 100);
  } else {
    this.accuracy = 0;
  }
  
  next();
});

// Експортуємо модель
module.exports = mongoose.model('GameResult', GameResultSchema);