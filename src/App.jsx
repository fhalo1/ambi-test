import { AppProvider, useApp } from './context/AppContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import Ranker from './pages/Ranker'
import StudyStack from './pages/StudyStack'
import Settings from './pages/Settings'

function AppLayout() {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" />
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/ranker" element={<Ranker />} />
          <Route path="/stack" element={<StudyStack />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  )
}


export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}