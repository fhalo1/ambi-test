// src/pages/StudyStack.jsx
import { useApp } from '../context/AppContext'
import { spotImageUrl } from '../api'

export default function StudyStack() {
  const { savedSpots, removeSpot, clearSpots, spotsLoading } = useApp()

  const handleExport = () => {
    const text = savedSpots
      .map((s, i) => `${i + 1}. ${s.name} — ${s.location} (Score: ${s.user_score || s.score})`)
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'my-study-stack.txt'
    a.click()
  }

  if (spotsLoading) return (
    <div className="page"><p className="page-subtitle">Loading your stack…</p></div>
  )

  return (
    <div className="page">
      <h2>My Study Stack</h2>
      <p className="page-subtitle">Your personal collection of saved study spots</p>

      <div className="stack-controls">
        <button onClick={handleExport} className="secondary-btn">Export</button>
        {savedSpots.length > 0 && (
          <button
            onClick={() => window.confirm('Clear your entire stack?') && clearSpots()}
            className="secondary-btn danger"
          >
            Clear Stack
          </button>
        )}
      </div>

      {savedSpots.length === 0 ? (
        <div className="empty-state">
          <p>No spots saved yet. Head to Dashboard or the Ranker to build your stack!</p>
        </div>
      ) : (
        <div className="stack-list">
          {savedSpots.map((spot, i) => {
            const imgSrc = spotImageUrl(spot.image_url)
            return (
              <div key={spot.id} className="stack-row">
                <span className="stack-rank">#{i + 1}</span>
                {imgSrc
                  ? <img src={imgSrc} alt={spot.name} className="stack-thumb" />
                  : <div className="stack-thumb placeholder" />
                }
                <div className="stack-info">
                  <strong>{spot.name}</strong>
                  <span>{spot.location}</span>
                  <div className="spot-tags" style={{ marginTop: 4 }}>
                    <span>{spot.noise}</span>
                    <span>{spot.wifi} WiFi</span>
                  </div>
                </div>
                <span className="stack-score">
                  {spot.user_score ? Number(spot.user_score).toFixed(1) : Number(spot.score).toFixed(1)}
                </span>
                <button
                  className="remove-btn"
                  onClick={() => removeSpot(spot.id)}
                  title="Remove from stack"
                >×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
