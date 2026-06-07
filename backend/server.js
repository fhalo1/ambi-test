// server.js — entry point for the Ambi backend
require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')
const { initDB } = require('./db')

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS: allow requests from the React frontend (and Vercel preview URLs)
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    /\.vercel\.app$/          // allows any Vercel preview deployment
  ],
  credentials: true
}))

// Parse JSON bodies
app.use(express.json())

// Serve uploaded images as static files
// e.g. GET /uploads/1234-filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',  require('./routes/auth'))
app.use('/api/spots', require('./routes/spots'))
app.use('/api/saved', require('./routes/saved'))
app.use('/api/users', require('./routes/users'))

// Health check — Render pings this to confirm the service is alive
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await initDB()          // create tables + seed default spots
  app.listen(PORT, () => {
    console.log(`🚀 Ambi backend running on port ${PORT}`)
  })
}

start().catch(err => {
  console.error('Failed to start:', err)
  process.exit(1)
})
