import { useState } from 'react'

const MOCK_PINS = [
  { id: 1, name: 'Philz Coffee', x: 25, y: 55, score: 9.1 },
  { id: 2, name: 'Summerfield Tea Bar', x: 45, y: 30, score: 8.8 },
  { id: 3, name: 'Wall Writers Coffee', x: 65, y: 45, score: 9.3 },
  { id: 4, name: 'Moongoat Coffee', x: 70, y: 60, score: 8.5 },
  { id: 5, name: 'Kit Coffee', x: 80, y: 25, score: 9.6 },
]

export default function MapView() {
  const [selected, setSelected] = useState(null)
  const [noiseFilter, setNoiseFilter] = useState(false)
  const [wifiFilter, setWifiFilter] = useState(false)

  return (
    <div className="page">
      <h2>Map View</h2>
      <p className="page-subtitle">Explore cafes near you</p>
      <div className="map-filters">
        <label>
          <input type="checkbox" checked={noiseFilter} onChange={e => setNoiseFilter(e.target.checked)} />
          Quiet only
        </label>
        <label>
          <input type="checkbox" checked={wifiFilter} onChange={e => setWifiFilter(e.target.checked)} />
          Fast WiFi only
        </label>
      </div>
      <div className="map-container">
        <div className="map-area">
          {MOCK_PINS.map(pin => (
            <button
              key={pin.id}
              className={`map-pin ${selected?.id === pin.id ? 'active' : ''}`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              onClick={() => setSelected(pin)}
            >
              📍
            </button>
          ))}
          {selected && (
            <div className="map-popup">
              <button className="popup-close" onClick={() => setSelected(null)}>×</button>
              <strong>{selected.name}</strong>
              <span>Score: {selected.score}</span>
            </div>
          )}
          <button className="search-area-btn">Search this area</button>
        </div>
      </div>
    </div>
  )
}