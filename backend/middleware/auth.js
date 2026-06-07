// middleware/auth.js — protects routes that require a logged-in user
const jwt = require('jsonwebtoken')

module.exports = function requireAuth(req, res, next) {
  // Expect: Authorization: Bearer <token>
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.userId   // attach userId to the request for use in routes
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
