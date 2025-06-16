// backend/routes/spaces.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Создать пространство
router.post('/', auth, async (req, res) => {
  const { name, address, capacity, description } = req.body;
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Имя и вместимость обязательны' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO spaces (name, address, capacity, description)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, address || null, capacity, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Space create error:', err);
    res.status(500).json({ error: 'Не удалось создать пространство' });
  }
});

// Получить список пространств
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM spaces ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Space list error:', err);
    res.status(500).json({ error: 'Не удалось получить список пространств' });
  }
});

// Получить одно пространство по id
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM spaces WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Space get error:', err);
    res.status(500).json({ error: 'Не удалось получить пространство' });
  }
});

// Обновить пространство
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, address, capacity, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE spaces SET 
         name = $1, 
         address = $2, 
         capacity = $3, 
         description = $4
       WHERE id = $5
       RETURNING *`,
      [name, address, capacity, description, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Space update error:', err);
    res.status(500).json({ error: 'Не удалось обновить пространство' });
  }
});

// Удалить пространство
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM spaces WHERE id = $1', [id]);
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error('Space delete error:', err);
    res.status(500).json({ error: 'Не удалось удалить пространство' });
  }
});

module.exports = router;