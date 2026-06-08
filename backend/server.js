// server.js - entry point for backend
require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')
const { initDB } = require('./db')

const app  = express()
const PORT = process.env.PORT || 3001

// middleware

// cors - allow requests from React frontend + Vercel preview url
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    /\.vercel\.app$/          // allows vercel preview deployment
  ],
  credentials: true
}))

// parse JSON bodies
app.use(express.json())

// serve uploaded images as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// routes
app.use('/api/auth',  require('./routes/auth'))
app.use('/api/spots', require('./routes/spots'))
app.use('/api/saved', require('./routes/saved'))
app.use('/api/users', require('./routes/users'))

// health check through render
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// start
async function start() {
  await initDB()          // create tables + seed default spots
  app.listen(PORT, () => {
    console.log(`Ambi backend running on port ${PORT}`)
  })
}

start().catch(err => {
  console.error('Failed to start:', err)
  process.exit(1)
})
