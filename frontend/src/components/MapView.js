import React from 'react';
export default function MapView({ onMapClick }) {
  return (
    <div style={{ width: '50%', padding: '20px' }}>
      <h2>Select Your Field</h2>
      <button onClick={() => onMapClick(41.8781, -87.6298)}>Simulate Pin Drop</button>
    </div>
  );
}