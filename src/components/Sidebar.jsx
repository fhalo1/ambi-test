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
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/map">Map</NavLink>
        <NavLink to="/ranker">Ranker</NavLink>
        <NavLink to="/stack">My Stack</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <div className="sidebar-footer">
        <span>{user?.email}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  )
}