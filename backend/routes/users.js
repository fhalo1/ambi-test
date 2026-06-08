// routes/users.js — user profile endpoints
const router = require('express').Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

// get api users
router.get('/me', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, university, created_at FROM users WHERE id=$1',
      [req.userId]
    )
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})



// put api users me
router.put('/me', async (req, res) => {
  const { full_name, university } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE users SET full_name=$1, university=$2 WHERE id=$3
       RETURNING id, email, full_name, university`,
      [full_name || null, university || null, req.userId]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
