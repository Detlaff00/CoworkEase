const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const registerSchema = Joi.object({
  first_name: Joi.string().min(1).required(),
  last_name: Joi.string().min(1).required(),
  birthdate: Joi.date().iso().required(),
  phone_number: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Пароли не совпадают' }),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required()
});

// Регистрация
router.post('/register', validate(registerSchema), async (req, res) => {
    const {
      first_name,
      last_name,
      birthdate,
      phone_number,
      email,
      password
    } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    try {
        // 1) Проверить, не занят ли email
        const exists = await pool.query(
            'SELECT id FROM users WHERE email = $1', [email]
        );
        if (exists.rows.length) {
            return res.status(409).json({ error: 'Email уже используется' });
        }
        // 2) Захешировать пароль
        const hash = await bcrypt.hash(password, 10);
        // 3) Вставить нового пользователя
        const result = await pool.query(
          `INSERT INTO users
            (first_name, last_name, birthdate, phone_number, email, password_hash)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, first_name, last_name, birthdate, phone_number, email, role`,
          [first_name, last_name, birthdate, phone_number, email, hash]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка регистрации' });
    }
});
// Логин
router.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    try {
        // 1) Найти пользователя
        const result = await pool.query(
            'SELECT id, password_hash, role FROM users WHERE email = $1', [email]
        );
        if (!result.rows.length) {
            return res.status(401).json({ error: 'Неверные учётные данные' });
        }
        const user = result.rows[0];
        const { id, role } = user;
        // 2) Сравнить пароли
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Неверные учётные данные' });
        }
        // 3) Выдать JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        // Set JWT as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60, // 1 hour
        });
        res.json({ message: 'Успешный вход' });
    } catch (err) {
        console.error('Login error:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

// Logout: clear the cookie
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Выход выполнен' });
});

// Изменение пароля
router.post('/change-password', auth, validate(changePasswordSchema), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    // Проверяем текущий хеш пароля
    const userRes = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!userRes.rows.length) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const match = await bcrypt.compare(oldPassword, userRes.rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }
    // Хешируем и обновляем новый пароль
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hash, req.user.id]
    );
    res.json({ message: 'Пароль успешно изменён' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Не удалось изменить пароль' });
  }
});

module.exports = router;