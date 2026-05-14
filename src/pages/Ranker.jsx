import { useState } from 'react'
import { useApp } from '../context/AppContext'

const SPOTS = [
  { id: 1, name: 'Philz Coffee', noise: 'Quiet', wifi: 'Fast', parking: 'Easy' },
  { id: 2, name: 'Summerfield Tea Bar', noise: 'Quiet', wifi: 'Moderate', parking: 'Easy' },
  { id: 3, name: 'Wall Writers Coffee', noise: 'Moderate', wifi: 'Fast', parking: 'Easy' },
  { id: 4, name: 'Moongoat Coffee', noise: 'Moderate', wifi: 'Excellent', parking: 'Hard' },
]

export default function Ranker() {
  const { saveSpot } = useApp()
  const [index, setIndex] = useState(0)
  const [wins, setWins] = useState({})
  const [done, setDone] = useState(false)

  const left = SPOTS[index % SPOTS.length]
  const right = SPOTS[(index + 1) % SPOTS.length]

  const handlePick = (winner) => {
    setWins(prev => ({ ...prev, [winner.id]: (prev[winner.id] || 0) + 1 }))
    if (index >= SPOTS.length - 2) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  if (done) {
    const sorted = [...SPOTS].sort((a, b) => (wins[b.id] || 0) - (wins[a.id] || 0))
    return (
      <div className="page">
        <h2>The Ranker</h2>
        <p className="page-subtitle">Your results</p>
        <div className="ranker-results">
          {sorted.map((spot, i) => (
            <div key={spot.id} className="result-row">
              <span className="result-rank">#{i + 1}</span>
              <span>{spot.name}</span>
              <button onClick={() => saveSpot(spot)}>Add to Stack</button>
            </div>
          ))}
          <button className="login-btn" onClick={() => { setIndex(0); setWins({}); setDone(false) }}>
            Restart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>The Ranker</h2>
      <p className="page-subtitle">Which spot would you study at?</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(index / (SPOTS.length - 1)) * 100}%` }} />
      </div>
      <div className="ranker-arena">
        {[left, right].map((spot) => (
          <div key={spot.id} className="ranker-card" onClick={() => handlePick(spot)}>
            <div className="ranker-image-placeholder" />
            <h3>{spot.name}</h3>
            <div className="spot-tags">
              <span>{spot.noise}</span>
              <span>{spot.wifi} WiFi</span>
              <span>{spot.parking} Parking</span>
            </div>
            <button className="pick-btn">Pick This Spot</button>
          </div>
        ))}
        <div className="vs-badge">VS</div>
      </div>
    </div>
  )
}