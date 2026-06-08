// src/pages/MySpots.jsx
// user submit their own study spots, w/ photo and rating
import { useState, useEffect } from 'react'
import { apiGetSpots, apiCreateSpot, apiDeleteSpot, spotImageUrl } from '../api'
import { useApp } from '../context/AppContext'

export default function MySpots() {
  const { user } = useApp()
  const [mySpots, setMySpots]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  // form fields
  const [name, setName]         = useState('')
  const [location, setLocation] = useState('')
  const [score, setScore]       = useState('')
  const [noise, setNoise]       = useState('Moderate')
  const [wifi, setWifi]         = useState('Moderate')
  const [parking, setParking]   = useState('Easy')
  const [image, setImage]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [submitting, setSubmitting] = useState(false)


  useEffect(() => {
    loadMySpots()
  }, [])

  async function loadMySpots() {
    try {
      const all = await apiGetSpots()
      // filter to spots the logged-in user created
      setMySpots(all.filter(s => s.created_by === user?.id))
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!name || !location) { setError('Name and location are required'); return }
    if (score && (isNaN(score) || score < 0 || score > 10)) {
      setError('Score must be between 0 and 10'); return
    }
    setError('')
    setSubmitting(true)

    try {
      // build FormData for image
      const fd = new FormData()
      fd.append('name', name)
      fd.append('location', location)
      fd.append('score', score || 0)
      fd.append('noise', noise)
      fd.append('wifi', wifi)
      fd.append('parking', parking)
      if (image) fd.append('image', image)

      await apiCreateSpot(fd)
      setSuccess('Spot added!')
      setTimeout(() => setSuccess(''), 3000)

      // reset form
      setName(''); setLocation(''); setScore(''); setImage(null); setPreview(null)
      setNoise('Moderate'); setWifi('Moderate'); setParking('Easy')
      setShowForm(false)
      await loadMySpots()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this spot?')) return
    try {
      await apiDeleteSpot(id)
      setMySpots(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h2>My Spots</h2>
      <p className="page-subtitle">Add and manage your own study spot submissions</p>

      <div className="stack-controls">
        <button className="login-btn" style={{ width: 'auto', padding: '8px 20px' }}
          onClick={() => setShowForm(f => !f)}>
          {showForm ? 'Cancel' : '+ Add a Spot'}
        </button>
        {success && <span style={{ color: '#2a7a2a', fontSize: 14 }}>{success}</span>}
      </div>

      {/* add spot form */}
      {showForm && (
        <div className="settings-section" style={{ marginTop: 20 }}>
          <h3>New Study Spot</h3>



          {/* photo upload */}
          <div className="image-upload-area">
            {preview
              ? <img src={preview} alt="Preview" className="upload-preview" />
              : <div className="upload-placeholder">Add a photo</div>
            }
            <label className="upload-label">
              {preview ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
          </div>

          <label>Spot Name *
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Blue Bottle Coffee" />
          </label>
          <label>Location *
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Santa Ana, CA" />
          </label>
          <label>Your Rating (0–10)
            <input type="number" min="0" max="10" step="0.1"
              value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 8.5" />
          </label>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ flex: 1, minWidth: 140 }}>Noise Level
              <select value={noise} onChange={e => setNoise(e.target.value)} className="select-field">
                <option>Quiet</option>
                <option>Moderate</option>
                <option>Lively</option>
              </select>
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>WiFi Speed
              <select value={wifi} onChange={e => setWifi(e.target.value)} className="select-field">
                <option>Excellent</option>
                <option>Fast</option>
                <option>Moderate</option>
                <option>Slow</option>
              </select>
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>Parking
              <select value={parking} onChange={e => setParking(e.target.value)} className="select-field">
                <option>Easy</option>
                <option>Moderate</option>
                <option>Hard</option>
              </select>
            </label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="login-btn" onClick={handleSubmit} disabled={submitting}
            style={{ marginTop: 8 }}>
            {submitting ? 'Saving…' : 'Submit Spot'}
          </button>
        </div>
      )}



      {/* my spot list */}
      {loading
        ? <p className="page-subtitle">Loading…</p>
        : mySpots.length === 0
          ? <div className="empty-state"><p>You haven't added any spots yet. Hit the button above to share one</p></div>
          : (
            <div className="spot-grid" style={{ marginTop: 24 }}>
              {mySpots.map(spot => {
                const imgSrc = spotImageUrl(spot.image_url)
                return (
                  <div key={spot.id} className="spot-card">
                    <div className="spot-score">{Number(spot.score).toFixed(1)}</div>
                    {imgSrc
                      ? <img src={imgSrc} alt={spot.name} className="spot-image" />
                      : <div className="spot-image-placeholder" />
                    }
                    <h3>{spot.name}</h3>
                    <p>{spot.location}</p>
                    <div className="spot-tags">
                      <span>{spot.noise}</span>
                      <span>{spot.wifi} WiFi</span>
                      <span>{spot.parking} Parking</span>
                    </div>
                    <button className="secondary-btn danger" style={{ width: '100%', marginTop: 8 }}
                      onClick={() => handleDelete(spot.id)}>
                      Delete
                    </button>
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
