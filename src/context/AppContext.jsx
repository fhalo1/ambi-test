// src/context/AppContext.jsx
// user session, saved spots + loading/error state
import { createContext, useContext, useState, useEffect } from 'react'
import { apiGetSaved, apiSaveSpot, apiRemoveSaved } from '../api'

const AppContext = createContext()

export function AppProvider({ children }) {
  // user loaded from localStorage on page refresh
  const [user, setUser]           = useState(() => {
    const stored = localStorage.getItem('ambi_user')
    return stored ? JSON.parse(stored) : null
  })
  const [savedSpots, setSavedSpots] = useState([])
  const [spotsLoading, setSpotsLoading] = useState(false)

  // when logged -> fetch saved stack from db
  useEffect(() => {
    if (user) fetchSaved()
  }, [user])

  async function fetchSaved() {
    setSpotsLoading(true)
    try {
      const data = await apiGetSaved()
      setSavedSpots(data)
    } catch {
      // if fetch fails (token expiration)
      setSavedSpots([])
    } finally {
      setSpotsLoading(false)
    }
  }

  // after successful login/register
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

  // save spot to stack (persisted to DB)
  async function saveSpot(spot, userScore) {
    try {
      await apiSaveSpot(spot.id, userScore)
      await fetchSaved()
    } catch (err) {
      console.error('Failed to save spot:', err)
    }
  }

  // remove spot from stack
  async function removeSpot(spotId) {
    try {
      await apiRemoveSaved(spotId)
      setSavedSpots(prev => prev.filter(s => s.id !== spotId))
    } catch (err) {
      console.error('Failed to remove spot:', err)
    }
  }

  // clear all saved spots (only local)
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
