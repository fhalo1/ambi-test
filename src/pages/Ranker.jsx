// src/pages/Ranker.jsx
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { apiGetSpots, spotImageUrl } from '../api'

export default function Ranker() {
  const { saveSpot } = useApp()
  const [spots, setSpots]   = useState([])
  const [index, setIndex]   = useState(0)
  const [wins, setWins]     = useState({})
  const [done, setDone]     = useState(false)
  const [added, setAdded]   = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    apiGetSpots()
      .then(data => setSpots(data.slice(0, 6)))  // compare top 6
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><p className="page-subtitle">Loading spots…</p></div>
  if (spots.length < 2) return <div className="page"><p>Not enough spots to rank.</p></div>

  const left  = spots[index % spots.length]
  const right = spots[(index + 1) % spots.length]

  const handlePick = (winner) => {
    setWins(prev => ({ ...prev, [winner.id]: (prev[winner.id] || 0) + 1 }))
    if (index >= spots.length - 2) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  const handleAddToStack = async (spot) => {
    await saveSpot(spot)
    setAdded(prev => [...prev, spot.id])
  }

  const handleRestart = () => {
    setIndex(0); setWins({}); setDone(false); setAdded([])
  }

  if (done) {
    const sorted = [...spots].sort((a, b) => (wins[b.id] || 0) - (wins[a.id] || 0))
    return (
      <div className="page">
        <h2>The Ranker</h2>
        <p className="page-subtitle">Your ranked results</p>
        <div className="ranker-results">
          {sorted.map((spot, i) => (
            <div key={spot.id} className="result-row">
              <span className="result-rank">#{i + 1}</span>
              <span style={{ flex: 1 }}>{spot.name}</span>
              <button
                onClick={() => handleAddToStack(spot)}
                disabled={added.includes(spot.id)}
                className={added.includes(spot.id) ? 'save-btn saved' : 'pick-btn'}
                style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}
              >
                {added.includes(spot.id) ? 'Added ✓' : 'Add to Stack'}
              </button>
            </div>
          ))}
          <button className="login-btn" onClick={handleRestart}>Restart</button>
        </div>
      </div>
    )
  }


  
  return (
    <div className="page">
      <h2>The Ranker</h2>
      <p className="page-subtitle">Which spot would you rather study at?</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(index / (spots.length - 1)) * 100}%` }} />
      </div>
      <div className="ranker-arena">
        {[left, right].map(spot => {
          const imgSrc = spotImageUrl(spot.image_url)
          return (
            <div key={spot.id} className="ranker-card" onClick={() => handlePick(spot)}>
              {imgSrc
                ? <img src={imgSrc} alt={spot.name} className="ranker-image" />
                : <div className="ranker-image-placeholder" />
                /* ↑ photo placement */
              }
              <h3>{spot.name}</h3>
              <p style={{ fontSize: 13, color: '#888', margin: '4px 0 8px' }}>{spot.location}</p>
              <div className="spot-tags">
                <span>{spot.noise}</span>
                <span>{spot.wifi} WiFi</span>
                <span>{spot.parking} Parking</span>
              </div>
              <button className="pick-btn">Pick This Spot</button>
            </div>
          )
        })}
        <div className="vs-badge">VS</div>
      </div>
    </div>
  )
}
