import React, { useState } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';

const COLORS = {
  bg: '#0a0f0d',
  surface: '#111c17',
  surfaceElevated: '#162620',
  border: '#1e3a2f',
  primary: '#2ecc71',
  primaryDark: '#27ae60',
  accent: '#f39c12',
  alertRed: '#e74c3c',
  alertOrange: '#e67e22',
  textPrimary: '#e8f5e9',
  textSecondary: '#81a89c',
  textMuted: '#4a7a67',
  headerBg: '#0d1f17',
};

const CROP_OPTIONS = ['Corn', 'Wheat', 'Soybean', 'Sorghum', 'Cotton', 'Rice'];
const PRIORITY_OPTIONS = ['Water', 'Profit', 'Soil Health'];

const selectStyle = {
  background: '#162620',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '8px',
  color: COLORS.textPrimary,
  padding: '6px 12px',
  fontSize: '13px',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2381a89c' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '30px',
};

export default function App() {
  const [fieldData, setFieldData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [currentCrop, setCurrentCrop] = useState('Corn');
  const [priority, setPriority] = useState('Water');
  const [error, setError] = useState(null);

  const handleEvaluate = async (lat, lon) => {
    setIsLoading(true);
    setError(null);
    setSelectedCoords({ lat, lon });
    try {
      const response = await fetch('http://localhost:8000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, current_crop: currentCrop, priority }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${response.status}`);
      }
      const data = await response.json();
      setFieldData(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f0d; }
        ::-webkit-scrollbar-thumb { background: #1e3a2f; border-radius: 3px; }
        select option { background: #162620; color: #e8f5e9; }
      `}</style>

      {/* Header */}
      <header style={{
        height: '64px',
        background: COLORS.headerBg,
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #1e3a2f, #2ecc71)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 2px 12px rgba(46,204,113,0.3)',
          }}>🌱</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px', color: COLORS.primary, letterSpacing: '-0.3px', lineHeight: 1 }}>
              TerraShift
            </div>
            <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '2px', letterSpacing: '0.3px' }}>
              Climate-Smart Crop Intelligence
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crop</span>
            <select value={currentCrop} onChange={e => setCurrentCrop(e.target.value)} style={selectStyle}>
              {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</span>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Analyze badge */}
          <div style={{
            padding: '7px 14px',
            background: selectedCoords
              ? 'linear-gradient(135deg, #1e3a2f, #27ae60)'
              : 'linear-gradient(135deg, #111c17, #162620)',
            border: `1px solid ${selectedCoords ? COLORS.primary : COLORS.border}`,
            borderRadius: '20px',
            fontSize: '12px',
            color: selectedCoords ? COLORS.textPrimary : COLORS.textMuted,
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.3s ease',
            boxShadow: selectedCoords ? '0 0 12px rgba(46,204,113,0.2)' : 'none',
          }}>
            <span style={{ fontSize: '14px' }}>{selectedCoords ? '📍' : '🗺️'}</span>
            <span>
              {selectedCoords
                ? `${selectedCoords.lat.toFixed(3)}°N, ${selectedCoords.lon.toFixed(3)}°E`
                : 'No field selected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Map: 55% */}
        <div style={{ width: '55%', height: '100%', flexShrink: 0 }}>
          <MapView
            onMapClick={handleEvaluate}
            selectedCoords={selectedCoords}
            isLoading={isLoading}
          />
        </div>

        {/* Right panel: 45% */}
        <div style={{ width: '45%', height: '100%', borderLeft: `1px solid ${COLORS.border}`, position: 'relative', overflow: 'hidden' }}>

          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(10,15,13,0.85)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 50,
              backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                width: '48px', height: '48px',
                border: `3px solid ${COLORS.border}`,
                borderTopColor: COLORS.primary,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '16px',
              }} />
              <div style={{ color: COLORS.primary, fontSize: '14px', fontWeight: 500 }}>Analyzing field data…</div>
              <div style={{ color: COLORS.textMuted, fontSize: '12px', marginTop: '6px' }}>Querying NASA satellite APIs</div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div style={{
              margin: '24px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #2d0a0a, #1a0808)',
              border: `1px solid ${COLORS.alertRed}`,
              borderRadius: '12px',
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <span style={{ color: '#ff6b6b', fontWeight: 600 }}>Analysis Failed</span>
              </div>
              <div style={{ color: '#ff9999', fontSize: '13px', lineHeight: 1.6 }}>{error.message}</div>
              <div style={{ color: COLORS.textMuted, fontSize: '12px', marginTop: '8px' }}>
                Make sure the backend is running on port 8000.
              </div>
            </div>
          )}

          {/* Dashboard */}
          {fieldData && !isLoading && !error && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <Dashboard data={fieldData} />
            </div>
          )}

          {/* Empty state */}
          {!fieldData && !isLoading && !error && (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
            }}>
              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <div style={{ fontSize: '72px', lineHeight: 1 }}>🌍</div>
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  width: '20px', height: '20px',
                  background: COLORS.primary,
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite',
                  boxShadow: '0 0 12px rgba(46,204,113,0.6)',
                }} />
              </div>
              <h2 style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '20px', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
                Select a Field to Analyze
              </h2>
              <p style={{ color: COLORS.textSecondary, fontSize: '14px', lineHeight: 1.7, maxWidth: '300px', margin: '0 0 32px' }}>
                Click anywhere on the map to analyze that field's climate conditions using NASA satellite data.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '280px' }}>
                {[
                  { icon: '🛰️', label: 'NASA SMAP soil moisture data' },
                  { icon: '🌡️', label: 'ECOSTRESS heat stress analysis' },
                  { icon: '🌾', label: '3 ranked rotation strategies' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    background: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '13px', color: COLORS.textSecondary,
                  }}>
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
