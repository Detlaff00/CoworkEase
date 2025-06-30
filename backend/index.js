require('dotenv').config();
require('./scheduler'); 

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');

const spaceRouter = require('./routes/spaces');
const authRouter = require('./routes/auth');
const pool = require('./db');
const bookingRouter = require('./routes/bookings');
const userRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const amenitiesRouter = require('./routes/amenities');



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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));



// Парсинг JSON и cookie
app.use(express.json());
app.use(cookieParser());

// Auth routes before other routers
app.use('/auth', authRouter);

app.use('/spaces', spaceRouter);
app.use('/bookings', bookingRouter);
app.use('/users', userRouter);
app.use('/amenities', amenitiesRouter);

app.use('/admin', adminRouter);

// Public endpoint to fetch all amenities
app.get('/amenities', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM amenities ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching amenities:', err);
    res.status(500).json({ error: 'Ошибка при получении удобств' });
  }
});

// Открытые маршруты
app.get('/', (req, res) => res.send('API is running'));

// Пример защищённого маршрута
app.get('/users/me', authMiddleware, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, first_name, last_name, birthdate, phone_number, email, role \
     FROM users WHERE id = $1',
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