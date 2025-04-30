const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config();
require('./models/User');
require('./models/Article');
require('./models/Test');
require('./models/ViewedArticle');
require('./models/CompletedTest');

const app = express();
const PORT = process.env.PORT || 5000;

// Налаштування CORS для доступу з frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-User-ID']
}));

app.use(express.json());
app.use(cookieParser());

// Middleware для декодування JWT токена та створення req.user
app.use((req, res, next) => {
  try {
    // Перевірка наявності токена в cookies
    const token = req.cookies.token;
    
    if (token) {
      // Декодування токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoaware_secure_jwt_token_2024');
      
      // Встановлення об'єкта користувача в запит
      req.user = decoded;
      
      console.log('Токен декодовано, користувач:', req.user.username);
    } else {
      console.log('Токен відсутній у запиті');
    }
  } catch (error) {
    console.error('Помилка при декодуванні токена:', error);
  }
  
  // Продовження обробки запиту
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoaware', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const articlesRoutes = require('./routes/articles');
const testsRoutes = require('./routes/tests');
const gamesRoutes = require('./routes/games');
const authRoutes = require('./routes/auth');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/games', gamesRoutes);

// Маршрут для тестування авторизації
app.get('/api/auth-test', (req, res) => {
  if (req.user) {
    res.json({ 
      message: 'Ви авторизовані', 
      userId: req.user.id,
      username: req.user.username 
    });
  } else {
    res.status(401).json({
      message: 'Ви не авторизовані'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});