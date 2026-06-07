// routes/spots.js — CRUD operations for study spots
const router  = require('express').Router()
const { pool } = require('../db')
const requireAuth = require('../middleware/auth')
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')

// Set up local image upload storage (images saved to /uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB max

// ── GET /api/spots ───────────────────────────────────────────────────────────
// Returns all spots. No auth required (public discovery).
// Query params: noise, wifi, parking  (optional filters)
router.get('/', async (req, res) => {
  try {
    const { noise, wifi, parking } = req.query
    let query  = 'SELECT * FROM spots WHERE 1=1'
    const vals = []
    if (noise)   { vals.push(noise);   query += ` AND noise   = $${vals.length}` }
    if (wifi)    { vals.push(wifi);    query += ` AND wifi    = $${vals.length}` }
    if (parking) { vals.push(parking); query += ` AND parking = $${vals.length}` }
    query += ' ORDER BY score DESC'
    const { rows } = await pool.query(query, vals)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── GET /api/spots/:id ───────────────────────────────────────────────────────
// Returns a single spot by id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM spots WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Spot not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/spots ──────────────────────────────────────────────────────────
// CREATE — adds a new user-submitted spot. Requires login.
// Accepts multipart/form-data so users can include an image file.
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  const { name, location, score, noise, wifi, parking, lat, lng } = req.body
  if (!name || !location) return res.status(400).json({ error: 'Name and location required' })

  const image_url = req.file ? `/uploads/${req.file.filename}` : null

  try {
    const { rows } = await pool.query(
      `INSERT INTO spots (name, location, score, noise, wifi, parking, image_url, lat, lng, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, location, score || 0, noise || 'Moderate', wifi || 'Moderate',
       parking || 'Easy', image_url, lat || null, lng || null, req.userId]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── PUT /api/spots/:id ───────────────────────────────────────────────────────
// UPDATE — user can only edit spots they created
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  const { name, location, score, noise, wifi, parking } = req.body
  try {
    // Check ownership
    const { rows: existing } = await pool.query('SELECT * FROM spots WHERE id=$1', [req.params.id])
    if (!existing[0]) return res.status(404).json({ error: 'Spot not found' })
    if (existing[0].created_by !== req.userId)
      return res.status(403).json({ error: 'Not your spot' })

    const image_url = req.file ? `/uploads/${req.file.filename}` : existing[0].image_url

    const { rows } = await pool.query(
      `UPDATE spots SET name=$1, location=$2, score=$3, noise=$4, wifi=$5, parking=$6, image_url=$7
       WHERE id=$8 RETURNING *`,
      [name || existing[0].name, location || existing[0].location,
       score || existing[0].score, noise || existing[0].noise,
       wifi  || existing[0].wifi,  parking || existing[0].parking,
       image_url, req.params.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── DELETE /api/spots/:id ────────────────────────────────────────────────────
// DELETE — user can only delete their own spots (not the seeded defaults)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM spots WHERE id=$1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Spot not found' })
    if (rows[0].is_default) return res.status(403).json({ error: 'Cannot delete default spots' })
    if (rows[0].created_by !== req.userId)
      return res.status(403).json({ error: 'Not your spot' })

    await pool.query('DELETE FROM spots WHERE id=$1', [req.params.id])
    res.json({ message: 'Spot deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
