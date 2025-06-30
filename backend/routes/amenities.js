const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /amenities — весь список удобств
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM amenities ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get amenities error:', err);
    res.status(500).json({ error: 'Ошибка при получении удобств' });
  }
});

module.exports = router;