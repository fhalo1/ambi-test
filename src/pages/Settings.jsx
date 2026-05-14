import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { user } = useApp()
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [friendUpdates, setFriendUpdates] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page">
      <h2>Settings & Preferences</h2>
      <p className="page-subtitle">Customize your Ambi experience</p>
      <section className="settings-section">
        <h3>Account Settings</h3>
        <div className="avatar-placeholder" />
        <label>Full Name
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
        </label>
        <label>Email
          <input value={user?.email || ''} disabled />
        </label>
        <label>University Education
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
      <button className="login-btn" onClick={handleSave}>
        {saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </div>
  )
}