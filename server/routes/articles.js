// server/routes/articles.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const ViewedArticle = require('../models/ViewedArticle');
const authRouter = require('./auth');

// Get the requireAuth middleware
const requireAuth = authRouter.requireAuth;

// Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Important: Define the /viewed endpoint BEFORE /:id to prevent route conflicts
router.get('/viewed', requireAuth, async (req, res) => {
  try {
    
    // Check if ViewedArticle model is registered
    if (!mongoose.modelNames().includes('ViewedArticle')) {
      console.error('ViewedArticle model is not registered!');
      return res.status(500).json({
        success: false,
        message: 'Server error: Model not registered',
        error: 'ViewedArticle model is not registered'
      });
    }
    
    // Get viewed articles for the user, sorted by last viewed date
    const viewedArticles = await ViewedArticle.find({ userId: req.user.id })
      .sort({ lastViewedAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      articles: viewedArticles 
    });
  } catch (error) {
    console.error('Error fetching viewed articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching viewed articles',
      error: error.toString(),
      stack: error.stack 
    });
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track article view - endpoint for authenticated users
router.post('/track-view', requireAuth, async (req, res) => {
  try {
    const { articleId, title, category } = req.body;
    const userId = req.user.id;
    
    if (!articleId || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Article ID and title are required' 
      });
    }
    
    // Check if the user has already viewed this article
    let viewedArticle = await ViewedArticle.findOne({ 
      userId, 
      articleId 
    });
    
    if (viewedArticle) {
      // If article was already viewed, update it
      viewedArticle.viewCount += 1;
      viewedArticle.lastViewedAt = Date.now();
      await viewedArticle.save();
    } else {
      // If not viewed yet, create new record
      viewedArticle = new ViewedArticle({
        userId,
        articleId,
        title,
        category: category || 'Інше'
      });
      await viewedArticle.save();
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Article view tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking article view:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while tracking article view' 
    });
  }
});

module.exports = router;