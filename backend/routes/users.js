// backend/routes/users.js
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /users/me — получить профиль
router.get('/me', auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, email, full_name, role FROM users WHERE id = $1',
            [req.user.id]
        );
        return res.json(rows[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ error: 'Не удалось получить профиль' });
    }
});

// DELETE /users/me — удалить текущего пользователя
router.delete('/me', auth, async (req, res) => {
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

// PUT /users/me — обновить email и/или пароль
router.put('/me', auth, async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        return res.status(400).json({ error: 'Нужно указать новый email и/или пароль' });
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
        // Собираем SQL
        const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, email, full_name, role
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