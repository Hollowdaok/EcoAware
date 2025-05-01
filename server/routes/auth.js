// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// Налаштування для cookies та JWT
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 днів
  sameSite: 'strict'
};

// Middleware для перевірки авторизації
const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  
  // Якщо немає токена - перенаправляємо на вхід
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Необхідна авторизація' 
    });
  }
  
  try {
    // Додайте лог для відладки
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoaware_secure_jwt_token_2024');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Помилка авторизації:', error);
    res.status(401).json({ success: false, message: 'Недійсний токен авторизації' });
  }
};

router.get('/test-auth', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Авторизація працює!',
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

// Тестовий маршрут для перевірки моделей
router.get('/test-models', requireAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Отримуємо список колекцій в базі даних
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Виводимо моделі Mongoose
    const registeredModels = mongoose.modelNames();
    
    res.json({
      success: true,
      message: 'Перевірка моделей',
      collections: collectionNames,
      registeredModels: registeredModels
    });
  } catch (error) {
    console.error('Помилка при перевірці моделей:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера',
      error: error.message
    });
  }
});

// Тестовий маршрут для створення тестових записів
router.post('/test-create-records', requireAuth, async (req, res) => {
  try {
    const ViewedArticle = require('../models/ViewedArticle');
    const CompletedTest = require('../models/CompletedTest');
    
    // Створення тестового запису для ViewedArticle
    const viewedArticle = new ViewedArticle({
      userId: req.user.id,
      articleId: 'test-article-123',
      title: 'Тестова стаття',
      category: 'Тест',
      viewCount: 1,
      firstViewedAt: Date.now(),
      lastViewedAt: Date.now()
    });
    
    await viewedArticle.save();
    
    // Створення тестового запису для CompletedTest
    const completedTest = new CompletedTest({
      userId: req.user.id,
      testId: 'test-test-456',
      title: 'Тестовий тест',
      category: 'Тест',
      score: 85,
      correctAnswers: 17,
      totalQuestions: 20,
      completedAt: Date.now()
    });
    
    await completedTest.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Тестові записи успішно створено',
      data: {
        viewedArticle,
        completedTest
      }
    });
  } catch (error) {
    console.error('Помилка при створенні тестових записів:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера',
      error: error.message
    });
  }
});

// Перевірка статусу авторизації
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.json({ isAuthenticated: false });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoaware_secure_jwt_token_2024');
    res.json({ 
      isAuthenticated: true, 
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      } 
    });
  } catch (error) {
    res.json({ isAuthenticated: false });
  }
});

// Реєстрація нового користувача
router.post('/register', [
  // Валідація даних
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Ім\'я користувача повинно містити від 3 до 30 символів')
    .custom(async value => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Користувач з таким ім\'ям вже існує');
      }
      return true;
    }),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Введіть коректну електронну адресу')
    .custom(async value => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Користувач з такою електронною адресою вже існує');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль повинен містити мінімум 6 символів'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Паролі не співпадають');
      }
      return true;
    })
], async (req, res) => {
  // Перевірка результатів валідації
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  try {
    const { username, email, password } = req.body;
    
    // Створення нового користувача (без firstName і lastName)
    const newUser = new User({
      username,
      email,
      password
    });
    
    // Збереження користувача в базі даних
    await newUser.save();
    
    // Створення JWT токена
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'ecoaware_secure_jwt_token_2024',
      { expiresIn: '7d' }
    );
    
    // Встановлення токена в cookie
    res.cookie('token', token, cookieOptions);
    
    // Відповідь з успішною реєстрацією
    res.status(201).json({
      success: true,
      message: 'Реєстрація успішна',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Помилка при реєстрації:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера при реєстрації' 
    });
  }
});

// Авторизація користувача
router.post('/login', [
  // Валідація даних
  body('username').trim().not().isEmpty().withMessage('Введіть ім\'я користувача'),
  body('password').not().isEmpty().withMessage('Введіть пароль')
], async (req, res) => {
  // Перевірка результатів валідації
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  try {
    const { username, password } = req.body;
    
    // Пошук користувача в базі даних
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неправильний логін або пароль' 
      });
    }
    
    // Перевірка пароля
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Неправильний логін або пароль' 
      });
    }
    
    // Оновлення часу останнього входу
    user.lastLogin = Date.now();
    await user.save();
    
    // Створення JWT токена
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'ecoaware_secure_jwt_token_2024',
      { expiresIn: '7d' }
    );
    
    // Встановлення токена в cookie
    res.cookie('token', token, cookieOptions);
    
    // Відповідь з успішною авторизацією
    res.json({
      success: true,
      message: 'Авторизація успішна',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Помилка при авторизації:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера при авторизації' 
    });
  }
});

// Вихід користувача
router.post('/logout', (req, res) => {
  // Очищення cookie з токеном
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.json({ 
    success: true, 
    message: 'Вихід успішний' 
  });
});

// Отримання інформації про поточного користувача
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Користувача не знайдено' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        registrationDate: user.registrationDate,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Помилка при отриманні даних користувача:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера при отриманні даних користувача' 
    });
  }
});

// Оновлення даних користувача
router.put('/me', requireAuth, [
  // Валідація даних
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Введіть коректну електронну адресу')
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value, _id: { $ne: req.user.id } });
      if (user) {
        throw new Error('Користувач з такою електронною адресою вже існує');
      }
      return true;
    })
], async (req, res) => {
  // Перевірка результатів валідації
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  try {
    const { firstName, lastName, email, avatar } = req.body;
    
    // Знаходження та оновлення користувача
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Користувача не знайдено' 
      });
    }
    
    // Оновлення даних
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Дані користувача оновлено успішно',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Помилка при оновленні даних користувача:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера при оновленні даних користувача' 
    });
  }
});

// Зміна пароля
router.put('/change-password', requireAuth, [
  // Валідація даних
  body('currentPassword').not().isEmpty().withMessage('Введіть поточний пароль'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Новий пароль повинен містити мінімум 6 символів'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Паролі не співпадають');
      }
      return true;
    })
], async (req, res) => {
  // Перевірка результатів валідації
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Знаходження користувача
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Користувача не знайдено' 
      });
    }
    
    // Перевірка поточного пароля
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Поточний пароль неправильний' 
      });
    }
    
    // Оновлення пароля
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Пароль змінено успішно'
    });
  } catch (error) {
    console.error('Помилка при зміні пароля:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Помилка сервера при зміні пароля' 
    });
  }
});

// Експорт requireAuth middleware для використання в інших маршрутах
router.requireAuth = requireAuth;

module.exports = router;