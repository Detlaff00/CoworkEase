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
        SELECT 
          b.id,
          CONCAT(u.first_name, ' ', u.last_name) AS user_name,
          u.email AS user_email,
          s.name AS space_name,
          b.booking_date,
          b.start_time,
          b.end_time,
          -- Recalculate cost: duration in hours * price_per_hour
          ROUND(EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600 * s.price_per_hour, 2) AS cost,
          b.status
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

// GET /admin/spaces — получить все пространства 
router.get(
  '/spaces',
  auth,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT
          s.id,
          s.name,
          s.address,
          s.capacity,
          s.price_per_hour,
          s.description,
          CONCAT(u.first_name, ' ', u.last_name) AS creator_name,
          u.email AS creator_email,
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
        JOIN users u ON s.created_by = u.id
        LEFT JOIN space_amenities sa ON sa.space_id = s.id
        LEFT JOIN amenities a ON a.id = sa.amenity_id
        GROUP BY 
          s.id,
          s.name,
          s.address,
          s.capacity,
          s.price_per_hour,
          s.description,
          u.first_name,
          u.last_name,
          u.email
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
    const { name, address, capacity, description, price_per_hour, amenities } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Insert new space
      const insertSpace = await client.query(
        `INSERT INTO spaces (name, address, capacity, description, price_per_hour)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, address, capacity, price_per_hour, description`,
        [name, address, capacity, description, price_per_hour]
      );
      const newSpace = insertSpace.rows[0];
      // Link amenities
      if (Array.isArray(amenities) && amenities.length) {
        const insertAmenityQuery = `
          INSERT INTO space_amenities (space_id, amenity_id, is_available)
          VALUES ($1, $2, TRUE)
          ON CONFLICT (space_id, amenity_id) DO UPDATE SET is_available = TRUE
        `;
        for (const amenityId of amenities) {
          await client.query(insertAmenityQuery, [newSpace.id, amenityId]);
        }
      }
      await client.query('COMMIT');
      // Return the newly created space
      res.status(201).json(newSpace);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error creating space:', err);
      res.status(500).json({ error: 'Не удалось создать пространство' });
    } finally {
      client.release();
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
    const { name, address, capacity, description, price_per_hour } = req.body;
    try {
      const { rowCount } = await pool.query(
        `UPDATE spaces
         SET name=$1, address=$2, capacity=$3, description=$4, price_per_hour=$5
         WHERE id=$6`,
        [name, address, capacity, description, price_per_hour, id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Не найдено' });
      const spaceId = id;
      const amenityIds = req.body.amenities || [];
      // Delete all old links, then insert/enable the provided ones
      await pool.query('DELETE FROM space_amenities WHERE space_id = $1', [spaceId]);
      for (const amenityId of amenityIds) {
        await pool.query(
          `INSERT INTO space_amenities (space_id, amenity_id, is_available)
           VALUES ($1, $2, TRUE)
           ON CONFLICT (space_id, amenity_id) DO UPDATE SET is_available = TRUE`,
          [spaceId, amenityId]
        );
      }
      // Fetch and return updated space with amenities
      const updatedResult = await pool.query(`
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
        GROUP BY
          s.id,
          s.name,
          s.address,
          s.capacity,
          s.price_per_hour,
          s.description
      `, [spaceId]);
      res.json(updatedResult.rows[0]);
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