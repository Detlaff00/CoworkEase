const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');


router.get(
  '/bookings',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT b.id,
               CONCAT(u.first_name, ' ', u.last_name) AS user_name,
               u.email   AS user_email,
               s.name    AS space_name,
               b.start_time,
               b.end_time
        FROM bookings b
        JOIN users u  ON b.user_id  = u.id
        JOIN spaces s ON b.space_id = s.id
        ORDER BY b.start_time DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error('Admin bookings error:', err);
      res.status(500).json({ error: 'Не удалось получить бронирования' });
    }
  }
);

module.exports = router;

// GET /admin/spaces — получить все пространства с info о создателе
router.get(
  '/spaces',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT s.id,
               s.name,
               s.address,
               s.capacity,
               s.description,
               CONCAT(u.first_name, ' ', u.last_name) AS creator_name,
               u.email     AS creator_email
        FROM spaces s
        JOIN users u ON s.created_by = u.id
        ORDER BY s.id;
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось получить пространства' });
    }
  }
);

// POST /admin/spaces — создать новое пространство
router.post(
  '/spaces',
  auth,
  requireRole('admin'),
  async (req, res) => {
    const { name, address, capacity, description } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO spaces (name, address, capacity, description)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [name, address, capacity, description,]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось создать пространство' });
    }
  }
);

// PUT /admin/spaces/:id — обновить
router.put(
  '/spaces/:id',
  auth,
  requireRole('admin'),
  async (req, res) => {
    const { id } = req.params;
    const { name, address, capacity, description } = req.body;
    try {
      const { rowCount } = await pool.query(
        `UPDATE spaces
         SET name=$1, address=$2, capacity=$3, description=$4
         WHERE id=$5`,
        [name, address, capacity, description, id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Не найдено' });
      res.json({ message: 'Обновлено' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось обновить' });
    }
  }
);

// DELETE /admin/spaces/:id
router.delete(
  '/spaces/:id',
  auth,
  requireRole('admin'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const { rowCount } = await pool.query(
        'DELETE FROM spaces WHERE id=$1',
        [id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Не найдено' });
      res.json({ message: 'Удалено' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось удалить' });
    }
  }
);