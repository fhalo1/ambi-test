// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Sidebar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box" />
        <span>Ambi</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/map"       className={({ isActive }) => isActive ? 'active' : ''}>Map</NavLink>
        <NavLink to="/ranker"    className={({ isActive }) => isActive ? 'active' : ''}>Ranker</NavLink>
        <NavLink to="/stack"     className={({ isActive }) => isActive ? 'active' : ''}>My Stack</NavLink>
        <NavLink to="/myspots"   className={({ isActive }) => isActive ? 'active' : ''}>My Spots</NavLink>
        <NavLink to="/settings"  className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink>
      </nav>

      <div className="sidebar-footer">
        <span>{user?.email}</span>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </aside>
  )
}
