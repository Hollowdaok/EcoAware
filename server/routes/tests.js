// server/routes/tests.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const CompletedTest = require('../models/CompletedTest');
const authRouter = require('./auth');

// Get the requireAuth middleware
const requireAuth = authRouter.requireAuth;

// IMPORTANT: Define the /completed endpoint BEFORE other routes to prevent conflicts
router.get('/completed', requireAuth, async (req, res) => {
  try {
    
    // Check if CompletedTest model is registered
    if (!mongoose.modelNames().includes('CompletedTest')) {
      console.error('CompletedTest model is not registered!');
      return res.status(500).json({
        success: false,
        message: 'Server error: Model not registered',
        error: 'CompletedTest model is not registered'
      });
    }
    
    // Get completed tests for the user, sorted by completion date
    const completedTests = await CompletedTest.find({ userId: req.user.id })
      .sort({ completedAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      tests: completedTests 
    });
  } catch (error) {
    console.error('Error fetching completed tests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching completed tests',
      error: error.toString(),
      stack: error.stack
    });
  }
});

// Track completed test - endpoint for authenticated users
router.post('/track-completion', requireAuth, async (req, res) => {
  try {
    const { testId, title, category, score, correctAnswers, totalQuestions, timestamp } = req.body;
    const userId = req.user.id;
    
    if (!testId || !title || score === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Test ID, title, and score are required' 
      });
    }
    
    // Перевірка на існування запису з такими ж параметрами за останні 10 хвилин
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
    
    const existingRecord = await CompletedTest.findOne({
      userId,
      testId,
      score,
      completedAt: { $gt: tenMinutesAgo }
    });
    
    if (existingRecord) {
      return res.status(200).json({ 
        success: true, 
        message: 'Тест вже було зареєстровано',
        duplicate: true 
      });
    }
    
    // Створення нового запису
    const completedTest = new CompletedTest({
      userId,
      testId,
      title,
      category: category || 'Інше',
      score,
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalQuestions || 0,
      completedAt: timestamp ? new Date(timestamp) : new Date()
    });
    
    await completedTest.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Результати тесту успішно збережено' 
    });
  } catch (error) {
    console.error('Error tracking test completion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while tracking test completion' 
    });
  }
});

// Get all tests
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    console.error('Error fetching tests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (err) {
    console.error('Error fetching test:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start test - remove correct answers for security
router.get('/:id/start', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Create a copy of the test without correct answers
    const testForUser = JSON.parse(JSON.stringify(test));
    
    // Remove isCorrect flag from each option to prevent cheating
    testForUser.questions.forEach(question => {
      question.options.forEach(option => {
        delete option.isCorrect;
      });
    });
    
    res.json(testForUser);
  } catch (err) {
    console.error('Error preparing test:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check test answers
router.post('/:id/check', async (req, res) => {
  try {
    const { answers } = req.body;
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Calculate results
    const results = {
      correctAnswers: 0,
      totalQuestions: test.questions.length,
      details: []
    };
    
    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctOptions = question.options
        .filter(option => option.isCorrect)
        .map(option => option._id.toString());
      
      // Get user selected options and convert to strings for comparison
      const userSelectedOptions = userAnswer.selectedOptions.map(optionId => optionId.toString());
      
      // Check if user's answer is correct (all correct options selected and no incorrect ones)
      const allCorrectOptionsSelected = correctOptions.every(optionId => 
        userSelectedOptions.includes(optionId)
      );
      
      const noIncorrectOptionsSelected = userSelectedOptions.every(optionId => 
        correctOptions.includes(optionId)
      );
      
      const isCorrect = allCorrectOptionsSelected && noIncorrectOptionsSelected;
      
      if (isCorrect) {
        results.correctAnswers++;
      }
      
      // Add detailed result for this question
      results.details.push({
        questionText: question.text,
        correct: isCorrect,
        userSelectedOptions: userSelectedOptions,
        correctOptions: correctOptions,
        explanation: question.explanation || ''
      });
    });
    
    // Calculate score as percentage
    results.score = (results.correctAnswers / results.totalQuestions) * 100;
    
    // Determine if test was passed based on passing score
    results.passed = results.score >= test.passingScore;
    
    res.json(results);
  } catch (err) {
    console.error('Error checking test answers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;