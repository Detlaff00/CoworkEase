// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

const auth = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');

const bookingSchema = Joi.object({
  space_id:   Joi.number().integer().required(),
  start_time: Joi.string().isoDate().required(),
  end_time:   Joi.string().isoDate().required()
});

// POST /bookings — создать бронирование
router.post('/', auth, validate(bookingSchema), async (req, res) => {
  const { space_id, start_time, end_time } = req.body;
  if (!space_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'space_id, start_time и end_time обязательны' });
  }
  try {
    // Проверка пересечений: есть ли уже бронь в этом интервале
    const conflict = await pool.query(
      `SELECT id FROM bookings
       WHERE space_id = $1
         AND tstzrange(start_time, end_time) && tstzrange($2::timestamp, $3::timestamp)`,
      [space_id, start_time, end_time]
    );
    if (conflict.rows.length) {
      return res.status(409).json({ error: 'Выбранное время уже занято' });
    }
    // Вставляем новую бронь
    const result = await pool.query(
      `INSERT INTO bookings (user_id, space_id, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, space_id, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Booking create error:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// GET /bookings — список бронирований текущего пользователя
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, s.name AS space_name
       FROM bookings b
       JOIN spaces s ON b.space_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.start_time`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Booking list error:', err);
    res.status(500).json({ error: 'Не удалось получить бронирования' });
  }
});

// DELETE /bookings/:id — отмена бронирования
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    // Проверяем, что бронь принадлежит текущему пользователю
    const check = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (!check.rows.length) {
      return res.status(404).json({ error: 'Бронь не найдена' });
    }
    // Удаляем запись
    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    res.json({ message: 'Бронь отменена' });
  } catch (err) {
    console.error('Booking delete error:', err);
    res.status(500).json({ error: 'Не удалось отменить бронь' });
  }
});

module.exports = router;