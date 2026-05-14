import { useState } from 'react'
import { useApp } from '../context/AppContext'

const MOCK_SPOTS = [
  { id: 1, name: 'Philz Coffee', location: 'Costa Mesa', score: 9.1, noise: 'Quiet', wifi: 'Fast', parking: 'Easy' },
  { id: 2, name: 'Summerfield Tea Bar', location: 'Garden Grove', score: 8.8, noise: 'Quiet', wifi: 'Moderate', parking: 'Easy' },
  { id: 3, name: 'Wall Writers Coffee', location: 'Irvine', score: 9.3, noise: 'Moderate', wifi: 'Fast', parking: 'Easy' },
  { id: 4, name: 'Moongoat Coffee', location: 'University Research Park', score: 8.5, noise: 'Moderate', wifi: 'Excellent', parking: 'Hard' },
  { id: 5, name: 'Lion & Lamb', location: 'Costa Mesa', score: 9.0, noise: 'Quiet', wifi: 'Fast', parking: 'Easy' },
  { id: 6, name: 'Kit Coffee', location: 'Newport Beach Library', score: 9.6, noise: 'Quiet', wifi: 'Excellent', parking: 'Hard' },
]

const NOISE_OPTIONS = ['All', 'Quiet', 'Moderate', 'Lively']

export default function Dashboard() {
  const { saveSpot } = useApp()
  const [search, setSearch] = useState('')
  const [noiseFilter, setNoiseFilter] = useState('All')
  const [saved, setSaved] = useState([])

  const filtered = MOCK_SPOTS.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(search.toLowerCase())
    const matchesNoise = noiseFilter === 'All' || spot.noise === noiseFilter
    return matchesSearch && matchesNoise
  })

  const handleSave = (spot) => {
    saveSpot(spot)
    setSaved(prev => [...prev, spot.id])
  }

  return (
    <div className="page">
      <h2>Discovery Dashboard</h2>
      <p className="page-subtitle">Browse study spots near you</p>
      <div className="dashboard-controls">
        <input
          className="search-input"
          placeholder="Search spots..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {NOISE_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`filter-tab ${noiseFilter === opt ? 'active' : ''}`}
              onClick={() => setNoiseFilter(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="spot-grid">
        {filtered.map(spot => (
          <div key={spot.id} className="spot-card">
            <div className="spot-score">{spot.score}</div>
            <div className="spot-image-placeholder" />
            <h3>{spot.name}</h3>
            <p>{spot.location}</p>
            <div className="spot-tags">
              <span>{spot.noise}</span>
              <span>{spot.wifi} WiFi</span>
              <span>{spot.parking} Parking</span>
            </div>
            <button
              className={`save-btn ${saved.includes(spot.id) ? 'saved' : ''}`}
              onClick={() => handleSave(spot)}
              disabled={saved.includes(spot.id)}
            >
              {saved.includes(spot.id) ? 'Saved ✓' : 'Save to Stack'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}