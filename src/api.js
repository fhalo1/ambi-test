// src/api.js
// VITE_API_URL -> .env.local for dev and vercel env vars -> production

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  return localStorage.getItem('ambi_token')
}



function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  }
}

// auth

export async function apiRegister(email, password) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data  // { token, user }
}

// spots

export async function apiGetSpots(filters = {}) {
  const params = new URLSearchParams(filters).toString()
  const res = await fetch(`${BASE}/api/spots${params ? '?' + params : ''}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

// spot creation w/ image
export async function apiCreateSpot(formData) {
  const res = await fetch(`${BASE}/api/spots`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function apiDeleteSpot(id) {
  const res = await fetch(`${BASE}/api/spots/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

// saved spots stack

export async function apiGetSaved() {
  const res = await fetch(`${BASE}/api/saved`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function apiSaveSpot(spot_id, user_score) {
  const res = await fetch(`${BASE}/api/saved`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ spot_id, user_score })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function apiRemoveSaved(spot_id) {
  const res = await fetch(`${BASE}/api/saved/${spot_id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

// user profile

export async function apiGetMe() {
  const res = await fetch(`${BASE}/api/users/me`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function apiUpdateMe(fields) {
  const res = await fetch(`${BASE}/api/users/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(fields)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export function spotImageUrl(image_url) {
  if (!image_url) return null
  if (image_url.startsWith('http')) return image_url
  if (image_url.startsWith('/images/')) return image_url
  return `${BASE}${image_url}`
}