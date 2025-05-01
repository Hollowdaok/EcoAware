const mongoose = require('mongoose');

const CompletedTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Інше'
  },
  score: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Створення індексу для швидкого пошуку за userId
CompletedTestSchema.index({ userId: 1 });

module.exports = mongoose.model('CompletedTest', CompletedTestSchema);