// db.js — sets up the PostgreSQL connection and creates tables on first run
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Required for Render's hosted PostgreSQL (SSL in production)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Creates all tables if they don't exist yet
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id        SERIAL PRIMARY KEY,
      email     TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      full_name TEXT,
      university TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS spots (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      location    TEXT NOT NULL,
      score       NUMERIC(3,1) DEFAULT 0,
      noise       TEXT DEFAULT 'Moderate',
      wifi        TEXT DEFAULT 'Moderate',
      parking     TEXT DEFAULT 'Easy',
      image_url   TEXT,
      lat         NUMERIC(9,6),
      lng         NUMERIC(9,6),
      created_by  INTEGER REFERENCES users(id),
      is_default  BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS saved_spots (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      spot_id    INTEGER REFERENCES spots(id) ON DELETE CASCADE,
      user_score NUMERIC(3,1),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, spot_id)
    );
  `)

  // Seed the 6 default spots if the table is empty
  const { rowCount } = await pool.query('SELECT 1 FROM spots WHERE is_default = TRUE LIMIT 1')
  if (rowCount === 0) {
    await pool.query(`
      INSERT INTO spots (name, location, score, noise, wifi, parking, lat, lng, is_default) VALUES
      ('Philz Coffee',       'Costa Mesa',                9.1, 'Quiet',    'Fast',      'Easy', 33.6412, -117.9187, TRUE),
      ('Summerfield Tea Bar','Garden Grove',              8.8, 'Quiet',    'Moderate',  'Easy', 33.7731, -117.9580, TRUE),
      ('Wall Writers Coffee','Irvine',                    9.3, 'Moderate', 'Fast',      'Easy', 33.6846, -117.8265, TRUE),
      ('Moongoat Coffee',    'University Research Park',  8.5, 'Moderate', 'Excellent', 'Hard', 33.6458, -117.8417, TRUE),
      ('Lion & Lamb',        'Costa Mesa',                9.0, 'Quiet',    'Fast',      'Easy', 33.6394, -117.9153, TRUE),
      ('Kit Coffee',         'Newport Beach',             9.6, 'Quiet',    'Excellent', 'Hard', 33.6161, -117.9289, TRUE);
    `)
    console.log('✅ Seeded default spots')
  }

  console.log('✅ Database ready')
}

module.exports = { pool, initDB }
