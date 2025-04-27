const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

router.get('/category/:categoryName', async (req, res) => {
  try {
    const articles = await Article.find({ category: req.params.categoryName }).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Статтю не знайдено' });
    }
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newArticle = new Article(req.body);
    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedArticle) {
      return res.status(404).json({ message: 'Статтю не знайдено' });
    }
    res.json(updatedArticle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Статтю не знайдено' });
    }
    res.json({ message: 'Статтю видалено успішно' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const articles = await Article.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } }
      ]
    }).sort({ date: -1 });
    
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;