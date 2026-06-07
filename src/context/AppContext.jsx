// src/context/AppContext.jsx
// Global state: user session, saved spots, and loading/error state
import { createContext, useContext, useState, useEffect } from 'react'
import { apiGetSaved, apiSaveSpot, apiRemoveSaved } from '../api'

const AppContext = createContext()

export function AppProvider({ children }) {
  // User is loaded from localStorage on page refresh
  const [user, setUser]           = useState(() => {
    const stored = localStorage.getItem('ambi_user')
    return stored ? JSON.parse(stored) : null
  })
  const [savedSpots, setSavedSpots] = useState([])
  const [spotsLoading, setSpotsLoading] = useState(false)

  // When the user logs in, fetch their saved stack from the database
  useEffect(() => {
    if (user) fetchSaved()
  }, [user])

  async function fetchSaved() {
    setSpotsLoading(true)
    try {
      const data = await apiGetSaved()
      setSavedSpots(data)
    } catch {
      // If fetch fails (e.g. token expired), silently reset
      setSavedSpots([])
    } finally {
      setSpotsLoading(false)
    }
  }

  // Called after successful login/register
  function login(userData, token) {
    localStorage.setItem('ambi_token', token)
    localStorage.setItem('ambi_user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('ambi_token')
    localStorage.removeItem('ambi_user')
    setUser(null)
    setSavedSpots([])
  }

  // Save a spot to the user's stack (persisted to DB)
  async function saveSpot(spot, userScore) {
    try {
      await apiSaveSpot(spot.id, userScore)
      await fetchSaved()   // re-fetch to keep UI in sync
    } catch (err) {
      console.error('Failed to save spot:', err)
    }
  }

  // Remove a spot from the stack
  async function removeSpot(spotId) {
    try {
      await apiRemoveSaved(spotId)
      setSavedSpots(prev => prev.filter(s => s.id !== spotId))
    } catch (err) {
      console.error('Failed to remove spot:', err)
    }
  }

  // Clear all saved spots (only locally; DB rows remain unless deleted individually)
  async function clearSpots() {
    for (const s of savedSpots) {
      await apiRemoveSaved(s.id).catch(() => {})
    }
    setSavedSpots([])
  }

  return (
    <AppContext.Provider value={{
      user, login, logout,
      savedSpots, saveSpot, removeSpot, clearSpots,
      spotsLoading, refreshSaved: fetchSaved
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
