// server/index.js (оновлений з авторизацією)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Додавання логування для відладки
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
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
const authRoutes = require('./routes/auth'); // Нові маршрути авторизації

// Routes
app.use('/api/articles', articlesRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/auth', authRoutes); // Додали маршрути авторизації

// Захист маршрутів для результатів гри
// Додаємо middleware авторизації для збереження результатів
app.use('/api/games/trash-sorting/results', authRoutes.requireAuth);

// Маршрут для тестування авторизації
app.get('/api/auth-test', authRoutes.requireAuth, (req, res) => {
  res.json({ 
    message: 'Ви авторизовані', 
    userId: req.user.id,
    username: req.user.username 
  });
});

// Прямий обробник маршруту для тестування
app.get('/api/tests-test', (req, res) => {
  res.json({ message: 'Tests API is working' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});