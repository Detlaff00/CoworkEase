const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');

const updateUserSchema = Joi.object({
  password: Joi.string().min(6).required()
});

// GET /profile — получить профиль с персональной статистикой
router.get('/profile', auth, async (req, res) => {
  try {
    // Получаем данные пользователя
    const userRes = await pool.query(
      `SELECT id, first_name, last_name, birthdate, phone_number, email, role
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );
    const user = userRes.rows[0];

    // Агрегируем статистику бронирований (исключая отменённые)
    const statsRes = await pool.query(
      `SELECT
         COUNT(*) AS total_bookings,
         COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 0)::numeric(10,2) AS total_hours,
         COALESCE(SUM(cost), 0)::numeric(10,2) AS total_spent
       FROM bookings
       WHERE user_id = $1
         AND status <> 'cancelled'`,
      [req.user.id]
    );
    const stats = statsRes.rows[0];

    // Format total_hours into HH:MM
    const totalHoursNum = parseFloat(stats.total_hours);
    const hours = Math.floor(totalHoursNum);
    const minutes = Math.round((totalHoursNum - hours) * 60);
    stats.total_time = `${hours}:${minutes.toString().padStart(2, '0')}`;

    return res.json({ ...user, stats });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Не удалось получить профиль' });
  }
});

// DELETE /profile — удалить текущего пользователя
router.delete('/profile', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Удаляем все брони пользователя
    await client.query('DELETE FROM bookings WHERE user_id = $1', [req.user.id]);
    // Удаляем пользователя
    await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    await client.query('COMMIT');
    // Очищаем куку
    res.clearCookie('token');
    return res.json({ message: 'Учётная запись удалена' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete user error:', err);
    return res.status(500).json({ error: 'Не удалось удалить учётную запись' });
  } finally {
    client.release();
  }
});

// PUT /profile — обновить пароль
router.put('/profile', auth, validate(updateUserSchema), async (req, res) => {
  const { password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2
       RETURNING id, first_name, last_name, birthdate, phone_number, email, role`,
      [hash, req.user.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ error: 'Не удалось обновить пароль' });
  }
});

module.exports = router;