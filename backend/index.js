
const cookieParser = require('cookie-parser');
require('dotenv').config();
const spaceRouter = require('./routes/spaces');
const express = require('express');
const authRouter = require('./routes/auth');
const pool = require('./db');
const authMiddleware = require('./middleware/auth');
const bookingRouter = require('./routes/bookings');
const userRouter = require('./routes/users');

const app = express();

// Парсинг JSON и cookie
app.use(express.json());
app.use(cookieParser());

app.use('/spaces', spaceRouter);
app.use('/bookings', bookingRouter);
app.use('/users', userRouter);

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