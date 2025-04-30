const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

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
app.use('/api/articles', articlesRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/auth', authRoutes);
// Захист маршрутів для результатів гри
app.use('/api/games/trash-sorting/results', authRoutes.requireAuth);

// Маршрут для тестування авторизації
app.get('/api/auth-test', authRoutes.requireAuth, (req, res) => {
  res.json({ 
    message: 'Ви авторизовані', 
    userId: req.user.id,
    username: req.user.username 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});