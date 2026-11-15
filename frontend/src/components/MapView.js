import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom green SVG marker
const greenIcon = L.divIcon({
  className: '',
  html: `
    <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.27 21.73 0 14 0z"
            fill="#2ecc71" stroke="#0a3d20" stroke-width="1.5" filter="url(#shadow)"/>
      <circle cx="14" cy="14" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="14" cy="14" r="3" fill="#27ae60"/>
    </svg>
  `,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -42],
});

// Inner component: handles map click events
function MapClickHandler({ onMapClick, isLoading }) {
  useMapEvents({
    click(e) {
      if (!isLoading) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Inner component: tracks mouse coordinate without re-rendering parent
function CoordinateTracker({ coordRef, setCoord }) {
  useMapEvents({
    mousemove(e) {
      const lat = e.latlng.lat.toFixed(4);
      const lon = e.latlng.lng.toFixed(4);
      const next = `${lat}°, ${lon}°`;
      if (coordRef.current !== next) {
        coordRef.current = next;
        setCoord(next);
      }
    },
    mouseout() {
      coordRef.current = null;
      setCoord(null);
    },
  });
  return null;
}

export default function MapView({ onMapClick, selectedCoords, isLoading }) {
  const [coord, setCoord] = useState(null);
  const coordRef = useRef(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>{`
        .leaflet-container { background: #0a0f0d !important; }
        .leaflet-popup-content-wrapper {
          background: #111c17 !important;
          border: 1px solid #1e3a2f !important;
          border-radius: 10px !important;
          color: #e8f5e9 !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip { background: #111c17 !important; }
        .leaflet-popup-content { margin: 10px 14px !important; font-family: 'Inter', sans-serif; }
        .leaflet-control-zoom a {
          background: #111c17 !important;
          border-color: #1e3a2f !important;
          color: #81a89c !important;
        }
        .leaflet-control-zoom a:hover { background: #162620 !important; color: #2ecc71 !important; }
        .leaflet-control-attribution {
          background: rgba(10,15,13,0.7) !important;
          color: #4a7a67 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: #81a89c !important; }
        @keyframes mapPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(46,204,113,0.5); }
          50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(46,204,113,0); }
        }
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>

      {/* Map hint badge — top left */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px',
        zIndex: 1000,
        background: 'rgba(10,15,13,0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e3a2f',
        borderRadius: '20px',
        padding: '6px 14px',
        fontSize: '12px',
        color: '#81a89c',
        display: 'flex', alignItems: 'center', gap: '6px',
        pointerEvents: 'none',
      }}>
        <span>🗺️</span>
        <span>Click map to select field</span>
      </div>

      {/* Loading indicator — top right */}
      {isLoading && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          zIndex: 1000,
          background: 'rgba(10,15,13,0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #2ecc71',
          borderRadius: '20px',
          padding: '6px 14px',
          fontSize: '12px',
          color: '#2ecc71',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}>
          <div style={{
            width: '8px', height: '8px',
            background: '#2ecc71',
            borderRadius: '50%',
            animation: 'mapPulse 1s ease-in-out infinite',
          }} />
          Fetching satellite data…
        </div>
      )}

      {/* Coordinate display bar — bottom */}
      {coord && (
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(10,15,13,0.8)',
          backdropFilter: 'blur(6px)',
          border: '1px solid #1e3a2f',
          borderRadius: '12px',
          padding: '5px 14px',
          fontSize: '12px',
          color: '#81a89c',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
        }}>
          📌 {coord}
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        <MapClickHandler onMapClick={onMapClick} isLoading={isLoading} />
        <CoordinateTracker coordRef={coordRef} setCoord={setCoord} />

        {selectedCoords && (
          <Marker position={[selectedCoords.lat, selectedCoords.lon]} icon={greenIcon}>
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontWeight: 600, color: '#2ecc71', marginBottom: '4px', fontSize: '13px' }}>
                  Selected Field
                </div>
                <div style={{ color: '#81a89c', fontSize: '12px', fontFamily: 'monospace' }}>
                  📍 {selectedCoords.lat.toFixed(4)}°N
                </div>
                <div style={{ color: '#81a89c', fontSize: '12px', fontFamily: 'monospace' }}>
                  {selectedCoords.lon.toFixed(4)}°E
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
