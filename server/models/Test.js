// server/models/Test.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  explanation: {
    type: String,
    default: ''
  }
});

const TestSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  questions: {
    type: [QuestionSchema],
    default: []  // Додаємо значення за замовчуванням порожній масив
  },
  estimatedTime: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['легкий', 'середній', 'складний'],
    default: 'середній'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  passingScore: {
    type: Number,
    default: 70
  }
}, { timestamps: true });

// Виправлене віртуальне поле з перевіркою на undefined
TestSchema.virtual('questionCount').get(function() {
  // Перевірка, чи questions існує і є масивом
  return this.questions && Array.isArray(this.questions) ? this.questions.length : 0;
});

// Забезпечуємо, щоб віртуальне поле включалося при перетворенні в JSON
TestSchema.set('toJSON', { virtuals: true });
TestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Test', TestSchema);