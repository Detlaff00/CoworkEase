require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');

const spaceRouter = require('./routes/spaces');
const authRouter = require('./routes/auth');
const pool = require('./db');
const bookingRouter = require('./routes/bookings');
const userRouter = require('./routes/users');



// Настройка CORS
const app = express();

const whitelist = ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));



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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Backend API запущен на http://localhost:${PORT}`));
}
module.exports = app;