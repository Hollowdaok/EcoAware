const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  readTime: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);