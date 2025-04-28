// server/routes/tests.js
const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

// Get all tests
router.get('/', async (req, res) => {
    try {
      // Модифікуємо запит, щоб включити кількість питань
      const tests = await Test.find().sort({ createdAt: -1 });
      
      // Трансформуємо результати для включення явного поля questionCount
      const transformedTests = tests.map(test => {
        const testObj = test.toObject({ virtuals: true });
        // Явно встановлюємо questionCount
        testObj.questionCount = test.questions ? test.questions.length : 0;
        return testObj;
      });
      
      res.json(transformedTests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  });

// Get tests by category
router.get('/category/:categoryName', async (req, res) => {
  try {
    const tests = await Test.find({ category: req.params.categoryName })
      .select('-questions')
      .sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Get test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Тест не знайдено' });
    }
    res.json(test);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Start test - повертає тест без правильних відповідей
router.get('/:id/start', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Тест не знайдено' });
    }
    
    // Створюємо версію тесту без правильних відповідей
    const testWithoutAnswers = {
      ...test.toObject(),
      questions: test.questions.map(question => ({
        _id: question._id,
        text: question.text,
        options: question.options.map(option => ({
          _id: option._id,
          text: option.text
          // Видаляємо isCorrect
        }))
        // Видаляємо explanation
      }))
    };
    
    res.json(testWithoutAnswers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Перевірка відповідей
router.post('/:id/check', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Тест не знайдено' });
    }
    
    const userAnswers = req.body.answers; // [{ questionId, selectedOptions: [optionId, ...] }, ...]
    
    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: 'Неправильний формат відповідей' });
    }
    
    // Обробка результатів
    const results = {
      totalQuestions: test.questions.length,
      correctAnswers: 0,
      wrongAnswers: 0,
      score: 0,
      details: []
    };
    
    userAnswers.forEach(userAnswer => {
      const question = test.questions.find(q => q._id.toString() === userAnswer.questionId);
      
      if (!question) return;
      
      const correctOptionIds = question.options
        .filter(option => option.isCorrect)
        .map(option => option._id.toString());
      
      const userOptionIds = Array.isArray(userAnswer.selectedOptions) 
        ? userAnswer.selectedOptions.map(id => id.toString())
        : [];
      
      // Перевірка чи всі відповіді користувача правильні і чи вибрав він усі правильні варіанти
      const allUserAnswersCorrect = userOptionIds.every(id => correctOptionIds.includes(id));
      const allCorrectOptionsSelected = correctOptionIds.every(id => userOptionIds.includes(id));
      const isCorrect = allUserAnswersCorrect && allCorrectOptionsSelected;
      
      if (isCorrect) {
        results.correctAnswers++;
      } else {
        results.wrongAnswers++;
      }
      
      results.details.push({
        questionId: question._id,
        questionText: question.text,
        correct: isCorrect,
        userSelectedOptions: userOptionIds,
        correctOptions: correctOptionIds,
        explanation: question.explanation
      });
    });
    
    // Підрахувати загальний бал
    results.score = (results.correctAnswers / results.totalQuestions) * 100;
    results.passed = results.score >= test.passingScore;
    
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Створити новий тест (тільки для адміністраторів)
router.post('/', async (req, res) => {
  try {
    const newTest = new Test(req.body);
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Оновити тест
router.put('/:id', async (req, res) => {
  try {
    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTest) {
      return res.status(404).json({ message: 'Тест не знайдено' });
    }
    res.json(updatedTest);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Видалити тест
router.delete('/:id', async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Тест не знайдено' });
    }
    res.json({ message: 'Тест видалено успішно' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Пошук тестів
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const tests = await Test.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } }
      ]
    }).select('-questions').sort({ createdAt: -1 });
    
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;