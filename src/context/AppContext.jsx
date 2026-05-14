import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [savedSpots, setSavedSpots] = useState([])
  const login = (email) => setUser({ email })
  const logout = () => setUser(null)
  const saveSpot = (spot) => setSavedSpots(prev => [...prev, spot])
  const clearSpots = () => setSavedSpots([])

  return (
    <AppContext.Provider value={{ user, login, logout, savedSpots, saveSpot, clearSpots }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}