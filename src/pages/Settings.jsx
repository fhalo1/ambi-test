// src/pages/Settings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { apiGetMe, apiUpdateMe } from '../api'

export default function Settings() {
  const { user, logout } = useApp()
  const navigate          = useNavigate()
  const [fullName, setFullName]   = useState('')
  const [university, setUniversity] = useState('')
  const [emailNotifs, setEmailNotifs]   = useState(true)
  const [friendUpdates, setFriendUpdates] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  
  useEffect(() => {
    apiGetMe()
      .then(data => {
        setFullName(data.full_name || '')
        setUniversity(data.university || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      await apiUpdateMe({ full_name: fullName, university })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert('Failed to save: ' + err.message)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <div className="page"><p className="page-subtitle">Loading…</p></div>

  return (
    <div className="page">
      <h2>Settings &amp; Preferences</h2>
      <p className="page-subtitle">Customize your Ambi experience</p>

      <section className="settings-section">
        <h3>Account</h3>
        <div className="avatar-placeholder" />
        <label>Full Name
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
        </label>
        <label>Email
          <input value={user?.email || ''} disabled />
        </label>
        <label>University
          <input value={university} onChange={e => setUniversity(e.target.value)} placeholder="e.g. UC Irvine" />
        </label>
      </section>

      <section className="settings-section">
        <h3>Notifications</h3>
        <label className="toggle-label">
          <input type="checkbox" checked={emailNotifs} onChange={e => setEmailNotifs(e.target.checked)} />
          Email notifications
        </label>
        <label className="toggle-label">
          <input type="checkbox" checked={friendUpdates} onChange={e => setFriendUpdates(e.target.checked)} />
          Friends activity updates
        </label>
      </section>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="login-btn" onClick={handleSave} style={{ width: 'auto', padding: '10px 28px' }}>
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
        <button
          className="secondary-btn"
          style={{ color: '#aa3333', borderColor: '#aa3333' }}
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
