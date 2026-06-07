// routes/auth.js — register and login endpoints
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')

// ── POST /api/auth/register ──────────────────────────────────────────────────
// Creates a new user account
// Body: { email, password }
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 6)  return res.status(400).json({ error: 'Password must be at least 6 characters' })

  try {
    const hashed = await bcrypt.hash(password, 12)
    const { rows } = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email.toLowerCase(), hashed]
    )
    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: rows[0].id, email: rows[0].email } })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' })
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/auth/login ─────────────────────────────────────────────────────
// Returns a JWT token on success
// Body: { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    if (!rows[0]) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, rows[0].password)
    if (!valid)  return res.status(401).json({ error: 'Invalid email or password' })

    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: rows[0].id, email: rows[0].email, full_name: rows[0].full_name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
