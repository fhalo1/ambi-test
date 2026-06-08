// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { apiGetSpots, spotImageUrl } from '../api'

const NOISE_OPTIONS = ['All', 'Quiet', 'Moderate', 'Lively']

export default function Dashboard() {
  const { saveSpot, savedSpots } = useApp()
  const [spots, setSpots]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [search, setSearch]         = useState('')
  const [noiseFilter, setNoiseFilter] = useState('All')
  const [justSaved, setJustSaved]   = useState([])

  useEffect(() => {
    loadSpots()
  }, [])

  async function loadSpots() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGetSpots()
      setSpots(data)
    } catch (err) {
      setError('Could not load spots. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const savedIds = savedSpots.map(s => s.id)

  const filtered = spots.filter(spot => {
    const matchSearch = spot.name.toLowerCase().includes(search.toLowerCase()) ||
                        spot.location.toLowerCase().includes(search.toLowerCase())
    const matchNoise  = noiseFilter === 'All' || spot.noise === noiseFilter
    return matchSearch && matchNoise
  })

  async function handleSave(spot) {
    await saveSpot(spot)
    setJustSaved(prev => [...prev, spot.id])
  }

  return (
    <div className="page">
      <h2>Discovery Dashboard</h2>
      <p className="page-subtitle">Browse study spots near you</p>

      <div className="dashboard-controls">
        <input
          className="search-input"
          placeholder="Search spots…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {NOISE_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`filter-tab ${noiseFilter === opt ? 'active' : ''}`}
              onClick={() => setNoiseFilter(opt)}
            >{opt}</button>
          ))}
        </div>
      </div>

      {loading && <p className="page-subtitle">Loading spots…</p>}
      {error   && <p className="error-text">{error}</p>}

      <div className="spot-grid">
        {filtered.map(spot => {
          const isSaved = savedIds.includes(spot.id) || justSaved.includes(spot.id)
          const imgSrc  = spotImageUrl(spot.image_url)
          return (
            <div key={spot.id} className="spot-card">
              <div className="spot-score">{Number(spot.score).toFixed(1)}</div>

              {}
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
              <button
                className={`save-btn ${isSaved ? 'saved' : ''}`}
                onClick={() => !isSaved && handleSave(spot)}
                disabled={isSaved}
              >
                {isSaved ? 'Saved ✓' : 'Save to Stack'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
