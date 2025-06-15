require('dotenv').config();
// backend/index.js
const express       = require('express');
const cookieParser  = require('cookie-parser');
const authRouter    = require('./routes/auth');
const pool          = require('./db');
const authMiddleware= require('./middleware/auth');

const app = express();

// Парсинг JSON и cookie
app.use(express.json());
app.use(cookieParser());



// Маршруты авторизации
app.use('/auth', authRouter);

// Открытые маршруты
app.get('/', (req, res) => res.send('API is running'));

// Пример защищённого маршрута
app.get('/users/me', authMiddleware, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, full_name, role FROM users WHERE id = $1',
    [req.user.id]
  );
  res.json(rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend API запущен на http://localhost:${PORT}`));