// routes/saved.js — manage user(personal stack)
const router = require('express').Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

// get api
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ss.id as saved_id, ss.user_score, ss.created_at as saved_at,
              s.*
       FROM saved_spots ss
       JOIN spots s ON s.id = ss.spot_id
       WHERE ss.user_id = $1
       ORDER BY ss.created_at DESC`,
      [req.userId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// post api saved
router.post('/', async (req, res) => {
  const { spot_id, user_score } = req.body
  if (!spot_id) return res.status(400).json({ error: 'spot_id required' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO saved_spots (user_id, spot_id, user_score)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, spot_id) DO UPDATE SET user_score = $3
       RETURNING *`,
      [req.userId, spot_id, user_score || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ─delete api saved spot
router.delete('/:spot_id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM saved_spots WHERE user_id=$1 AND spot_id=$2',
      [req.userId, req.params.spot_id]
    )
    res.json({ message: 'Removed from stack' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
