// src/pages/MapView.jsx
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { apiGetSpots, spotImageUrl } from '../api'

export default function MapView() {
  const { saveSpot, savedSpots } = useApp()
  const [spots, setSpots]         = useState([])
  const [selected, setSelected]   = useState(null)
  const [noiseFilter, setNoiseFilter] = useState(false)
  const [wifiFilter, setWifiFilter]   = useState(false)
  const [justSaved, setJustSaved]     = useState([])

  useEffect(() => {
    apiGetSpots().then(setSpots).catch(() => {})
  }, [])

  const savedIds = savedSpots.map(s => s.id)

  // Only show spots that have coordinates (lat/lng)
  const pins = spots.filter(s => s.lat && s.lng).filter(s => {
    if (noiseFilter && s.noise !== 'Quiet') return false
    if (wifiFilter  && s.wifi  !== 'Excellent' && s.wifi !== 'Fast') return false
    return true
  })

  // Map bounding box for OC area (lat 33.55–33.85, lng -118.05 to -117.75)
  function toPercent(spot) {
    const x = ((spot.lng - (-118.05)) / 0.30) * 100
    const y = ((33.85 - spot.lat)     / 0.30) * 100
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  async function handleSave(spot) {
    await saveSpot(spot)
    setJustSaved(prev => [...prev, spot.id])
  }

  return (
    <div className="page">
      <h2>Map View</h2>
      <p className="page-subtitle">Explore cafes near you — click a pin to see details</p>

      <div className="map-filters">
        <label>
          <input type="checkbox" checked={noiseFilter} onChange={e => setNoiseFilter(e.target.checked)} />
          Quiet only
        </label>
        <label>
          <input type="checkbox" checked={wifiFilter} onChange={e => setWifiFilter(e.target.checked)} />
          Fast/Excellent WiFi only
        </label>
      </div>

      <div className="map-container">
        {/* MAP AREA — currently a styled placeholder showing OC geography.
            To use a real map: swap this div for a Leaflet/Mapbox component.
            The pin positions below are calculated from real lat/lng coordinates. */}
        <div className="map-area" onClick={() => setSelected(null)}>

          {pins.map(spot => {
            const { x, y } = toPercent(spot)
            return (
              <button
                key={spot.id}
                className={`map-pin ${selected?.id === spot.id ? 'active' : ''}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={e => { e.stopPropagation(); setSelected(spot) }}
                title={spot.name}
              >
                📍
              </button>
            )
          })}

          {/* POP-UP — shows when a pin is clicked */}
          {selected && (
            <div className="map-popup" onClick={e => e.stopPropagation()}>
              <button className="popup-close" onClick={() => setSelected(null)}>×</button>

              {/* PHOTO PLACEMENT — spot image shows here if one exists */}
              {spotImageUrl(selected.image_url) && (
                <img
                  src={spotImageUrl(selected.image_url)}
                  alt={selected.name}
                  className="popup-image"
                />
              )}

              <strong className="popup-name">{selected.name}</strong>
              <span className="popup-location">{selected.location}</span>

              <div className="popup-score">⭐ {Number(selected.score).toFixed(1)}</div>

              <div className="spot-tags" style={{ marginTop: 6 }}>
                <span>{selected.noise}</span>
                <span>{selected.wifi} WiFi</span>
                <span>{selected.parking} Parking</span>
              </div>

              {(() => {
                const isSaved = savedIds.includes(selected.id) || justSaved.includes(selected.id)
                return (
                  <button
                    className={`save-btn ${isSaved ? 'saved' : ''}`}
                    style={{ marginTop: 10 }}
                    onClick={() => !isSaved && handleSave(selected)}
                    disabled={isSaved}
                  >
                    {isSaved ? 'Saved ✓' : 'Save to Stack'}
                  </button>
                )
              })()}
            </div>
          )}

          <div className="map-label">Orange County, CA</div>
        </div>
      </div>

      {pins.length === 0 && (
        <p className="page-subtitle" style={{ marginTop: 16 }}>
          No spots with coordinates to show. Add spots with a location to see them on the map.
        </p>
      )}
    </div>
  )
}
