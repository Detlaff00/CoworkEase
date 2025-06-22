const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const validate = require('../middleware/validate');

const registerSchema = Joi.object({
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).required(),
  full_name: Joi.string().allow('', null)
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Регистрация
router.post('/register', validate(registerSchema), async (req, res) => {
    const { email, password, full_name } = req.body;
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
            `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name`,
            [email, hash, full_name || null]
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

module.exports = router;