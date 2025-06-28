const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');

const updateUserSchema = Joi.object({
  first_name: Joi.string().min(1),
  last_name: Joi.string().min(1),
  birthdate: Joi.date().iso(),
  phone_number: Joi.string().min(5),
  email: Joi.string().email(),
  password: Joi.string().min(6),
}).or('first_name', 'last_name', 'birthdate', 'phone_number', 'email', 'password');

// GET /profile — получить профиль
router.get('/profile', auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, first_name, last_name, birthdate, phone_number, email, role FROM users WHERE id = $1',
            [req.user.id]
        );
        return res.json(rows[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ error: 'Не удалось получить профиль' });
    }
});

// DELETE /profile — удалить текущего пользователя
router.delete('/proffile', auth, async (req, res) => {
    try {
        // Удаляем все его брони (если нужно сохранить чистую FK-целостность)
        await pool.query('DELETE FROM bookings WHERE user_id = $1', [req.user.id]);
        // Удаляем самого пользователя
        await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
        // Очищаем куку, чтобы разлогиниться
        res.clearCookie('token');
        return res.json({ message: 'Учётная запись удалена' });
    } catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({ error: 'Не удалось удалить учётную запись' });
    }
});

// PUT /profile — обновить email и/или пароль
router.put('/profile', auth, validate(updateUserSchema), async (req, res) => {
    const {
      first_name,
      last_name,
      birthdate,
      phone_number,
      email,
      password
    } = req.body;
    if (!first_name && !last_name && !birthdate && !phone_number && !email && !password) {
        return res.status(400).json({ error: 'Нужно указать новые данные для обновления' });
    }
    try {
        // Подготовим части запроса в зависимости от переданных полей
        const fields = [];
        const values = [];
        let idx = 1;

        if (email) {
            fields.push(`email = $${idx++}`);
            values.push(email);
        }
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            fields.push(`password_hash = $${idx++}`);
            values.push(hash);
        }
        if (first_name) {
          fields.push(`first_name = $${idx++}`);
          values.push(first_name);
        }
        if (last_name) {
          fields.push(`last_name = $${idx++}`);
          values.push(last_name);
        }
        if (birthdate) {
          fields.push(`birthdate = $${idx++}`);
          values.push(birthdate);
        }
        if (phone_number) {
          fields.push(`phone_number = $${idx++}`);
          values.push(phone_number);
        }
        // Собираем SQL
        const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, first_name, last_name, birthdate, phone_number, email, role
    `;
        values.push(req.user.id);

        const result = await pool.query(sql, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update user error:', err);
        // Если попытка задать занятый email — сработает UNIQUE
        const msg = err.code === '23505'
            ? 'Этот email уже используется'
            : 'Не удалось обновить данные пользователя';
        res.status(500).json({ error: msg });
    }
});
module.exports = router;