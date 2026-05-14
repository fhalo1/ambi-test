import { useApp } from '../context/AppContext'

export default function StudyStack() {
  const { savedSpots, clearSpots } = useApp()

  const handleClear = () => {
    clearSpots([])
  }

  const handleShare = () => {
    alert('Share feature coming soon')
  }

  const handleExport = () => {
    const text = savedSpots.map((s, i) => `${i + 1}. ${s.name} - ${s.score}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-study-stack.txt'
    a.click()
  }

  return (
    <div className="page">
      <h2>My Study Stack</h2>
      <p className="page-subtitle">Your personal ranking of study spots</p>
      <div className="stack-controls">
        <button onClick={handleShare} className="secondary-btn">Share</button>
        <button onClick={handleExport} className="secondary-btn">Export</button>
        {savedSpots.length > 0 && (
          <button onClick={handleClear} className="secondary-btn" style={{ color: '#aa3333' }}>Clear Stack</button>
        )}
      </div>
      {savedSpots.length === 0 ? (
        <div className="empty-state">
          <p>No spots saved yet. Head to Dashboard or the Ranker to build your stack!</p>
        </div>
      ) : (
        <div className="stack-list">
          {savedSpots.map((spot, i) => (
            <div key={i} className="stack-row">
              <span className="stack-rank">#{i + 1}</span>
              <div className="stack-info">
                <strong>{spot.name}</strong>
                <span>{spot.location}</span>
              </div>
              <span className="stack-score">{spot.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}