// routes/saved.js — manage a user's personal saved spots (their "stack")
const router = require('express').Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/auth')

// All routes here require a logged-in user
router.use(requireAuth)

// ── GET /api/saved ────────────────────────────────────────────────────────────
// Returns all spots saved by the current user, with spot details joined in
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

// ── POST /api/saved ───────────────────────────────────────────────────────────
// Saves a spot to the user's stack
// Body: { spot_id, user_score (optional) }
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

// ── DELETE /api/saved/:spot_id ────────────────────────────────────────────────
// Removes a spot from the user's stack
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
