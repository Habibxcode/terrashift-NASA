import React, { useState } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';

function App() {
  const [fieldData, setFieldData] = useState(null);

  const handleEvaluate = async (lat, lon) => {
    // Call backend API
    const response = await fetch('http://localhost:8000/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, current_crop: 'Corn', priority: 'Water' })
    });
    const data = await response.json();
    setFieldData(data);
  };

  return (
    <div style={{ display: 'flex' }}>
      <MapView onMapClick={handleEvaluate} />
      {fieldData && <Dashboard data={fieldData} />}
    </div>
  );
}
export default App;
