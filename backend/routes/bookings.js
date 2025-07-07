const express = require('express');
const router = express.Router();
const pool = require('../db');

const auth = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');

const bookingSchema = Joi.object({
  space_id: Joi.number().integer().required(),
  start_time: Joi.string().isoDate().required(),
  end_time: Joi.string().isoDate().required()
});

// POST /bookings — создать бронирование
router.post('/', auth, validate(bookingSchema), async (req, res) => {
  const { space_id, start_time, end_time } = req.body;
  if (!space_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'space_id, start_time и end_time обязательны' });
  }
  const booking_date = start_time.split('T')[0];

  const startTimeOnly = start_time.split('T')[1];
  const endTimeOnly = end_time.split('T')[1];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Проверка пересечений: есть ли уже бронь в этом интервале
    const conflict = await client.query(
      `SELECT id FROM bookings
       WHERE space_id = $1
         AND status <> 'cancelled'
         AND booking_date = $2
         AND NOT ($4 <= start_time OR $3 >= end_time)`,
      [space_id, booking_date, startTimeOnly, endTimeOnly]
    );
    if (conflict.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Выбранное время уже занято' });
    }
    // Calculate cost based on space price_per_hour
    const spaceRes = await client.query(
      'SELECT price_per_hour FROM spaces WHERE id = $1',
      [space_id]
    );
    if (!spaceRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Пространство не найдено' });
    }
    const pricePerHour = parseFloat(spaceRes.rows[0].price_per_hour);
    // Compute duration in hours
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    const durationHours = (endDate - startDate) / 1000 / 3600;
    const cost = parseFloat((durationHours * pricePerHour).toFixed(2));
    // Вставляем новую бронь
    const result = await client.query(
      `INSERT INTO bookings (space_id, user_id, booking_date, start_time, end_time, cost)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [space_id, req.user.id, booking_date, startTimeOnly, endTimeOnly, cost]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Booking create error:', err.stack);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /bookings — список бронирований текущего пользователя
router.get('/', auth, async (req, res) => {
  try {
    // Автоматически помечаем просроченные брони как completed
    await pool.query(`
      UPDATE bookings
         SET status = 'completed'
       WHERE status = 'active'
         AND (booking_date < CURRENT_DATE
              OR (booking_date = CURRENT_DATE AND end_time < CURRENT_TIME))
    `);

    const result = await pool.query(
      `SELECT
         b.id,
         b.space_id,
         s.name AS space_name,
         b.booking_date,
         b.start_time,
         b.end_time,
         b.cost,
         b.status
       FROM bookings b
       JOIN spaces s ON b.space_id = s.id
       WHERE b.user_id = $1
         AND b.status = 'active'
       ORDER BY b.booking_date, b.start_time`,
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
    // Помечаем бронирование как отменённое
    await pool.query(
      'UPDATE bookings SET status = \'cancelled\' WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    res.json({ message: 'Бронь отменена' });
  } catch (err) {
    console.error('Booking delete error:', err);
    res.status(500).json({ error: 'Не удалось отменить бронь' });
  }
});
// GET /bookings/history — список завершённых и отменённых броней
router.get('/history', auth, async (req, res) => {
  try {
    // Автоматически помечаем активные, но уже прошедшие, как completed
    await pool.query(`
      UPDATE bookings
         SET status = 'completed'
       WHERE status = 'active'
         AND (booking_date < CURRENT_DATE
              OR (booking_date = CURRENT_DATE AND end_time < CURRENT_TIME))
    `);

    // Выбираем все completed и cancelled брони текущего пользователя
    const result = await pool.query(
      `SELECT 
         b.id,
         b.space_id,
         s.name    AS space_name,
         b.booking_date,
         b.start_time,
         b.end_time,
         b.cost,
         b.status
       FROM bookings b
       JOIN spaces s ON b.space_id = s.id
       WHERE b.user_id = $1
         AND b.status IN ('completed','cancelled')
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Booking history error:', err);
    res.status(500).json({ error: 'Не удалось получить историю бронирований' });
  }
});



module.exports = router;