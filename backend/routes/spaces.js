const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');

const spaceSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().allow(null, ''),
  capacity: Joi.number().integer().min(1).required(),
  description: Joi.string().allow(null, ''),
  price_per_hour: Joi.number().precision(2).required(),
  amenities: Joi.array().items(Joi.number().integer()).optional()
});
// Создать пространство
router.post('/', auth, validate(spaceSchema), async (req, res) => {
  const { name, address, capacity, description, price_per_hour, amenities } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Create space
    const insertRes = await client.query(
      `INSERT INTO spaces (name, address, capacity, description, price_per_hour)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, address || null, capacity, description || null, price_per_hour]
    );
    const newSpace = insertRes.rows[0];
    // Link amenities
    if (Array.isArray(amenities) && amenities.length) {
      const upsertAmenity = `
        INSERT INTO space_amenities (space_id, amenity_id, is_available)
        VALUES ($1, $2, TRUE)
        ON CONFLICT (space_id, amenity_id) DO UPDATE SET is_available = TRUE
      `;
      for (const amenityId of amenities) {
        await client.query(upsertAmenity, [newSpace.id, amenityId]);
      }
    }
    await client.query('COMMIT');
    res.status(201).json(newSpace);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Space create error stack:', err.stack);
    console.error('CREATE SPACE BODY was:', JSON.stringify(req.body));
    res.status(500).json({
      error: 'Не удалось создать пространство',
      message: err.message,
      stack: err.stack.split('\n'),
    });
  } finally {
    client.release();
  }
});

// Получить список пространств
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    // Build dynamic SQL with optional search
    let sql = `
      SELECT
        s.id,
        s.name,
        s.address,
        s.capacity,
        s.price_per_hour,
        s.description,
        COALESCE(
          json_agg(
            json_build_object(
              'amenity_id', a.id,
              'name', a.name,
              'is_available', sa.is_available
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS amenities
      FROM spaces s
      LEFT JOIN space_amenities sa ON sa.space_id = s.id
      LEFT JOIN amenities a ON a.id = sa.amenity_id
    `;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      sql += ` WHERE s.name ILIKE $${params.length}`;
    }
    sql += `
      GROUP BY s.id
      ORDER BY s.id;
    `;
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Space list error:', err);
    res.status(500).json({ error: 'Не удалось получить список пространств' });
  }
});

// Получить одно пространство по id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.address,
        s.capacity,
        s.price_per_hour,
        s.description,
        COALESCE(
          json_agg(
            json_build_object(
              'amenity_id', a.id,
              'name', a.name,
              'is_available', sa.is_available
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS amenities
      FROM spaces s
      LEFT JOIN space_amenities sa ON sa.space_id = s.id
      LEFT JOIN amenities a ON a.id = sa.amenity_id
      WHERE s.id = $1
      GROUP BY s.id;
    `, [id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Не найдено' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Space get error:', err);
    res.status(500).json({ error: 'Не удалось получить пространство' });
  }
});

// Обновить пространство
router.put('/:id', auth, validate(spaceSchema), async (req, res) => {
  const { id } = req.params;
  const { name, address, capacity, description, price_per_hour, amenities } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Update space
    const updateRes = await client.query(
      `UPDATE spaces SET 
         name = $1, 
         address = $2, 
         capacity = $3, 
         description = $4,
         price_per_hour = $5
       WHERE id = $6 RETURNING *`,
      [name, address || null, capacity, description || null, price_per_hour, id]
    );
    if (!updateRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Не найдено' });
    }
    const updatedSpace = updateRes.rows[0];
    // Upsert selected amenities
    const upsertAmenity = `
      INSERT INTO space_amenities (space_id, amenity_id, is_available)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (space_id, amenity_id) DO UPDATE SET is_available = TRUE
    `;
    const selected = Array.isArray(amenities) ? amenities : [];
    for (const amenityId of selected) {
      await client.query(upsertAmenity, [updatedSpace.id, amenityId]);
    }
    // Disable unselected amenities
    await client.query(
      `UPDATE space_amenities 
         SET is_available = FALSE 
       WHERE space_id = $1 AND amenity_id <> ALL($2::int[])`,
      [updatedSpace.id, selected]
    );
    await client.query('COMMIT');
    res.json(updatedSpace);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Space update error:', err);
    res.status(500).json({ error: 'Не удалось обновить пространство' });
  } finally {
    client.release();
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