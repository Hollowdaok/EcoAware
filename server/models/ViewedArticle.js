// server/models/ViewedArticle.js
const mongoose = require('mongoose');

const ViewedArticleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
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
  viewCount: {
    type: Number,
    default: 1
  },
  firstViewedAt: {
    type: Date,
    default: Date.now
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  }
});

// Створення складеного індексу для швидкого пошуку за userId та articleId
ViewedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('ViewedArticle', ViewedArticleSchema);