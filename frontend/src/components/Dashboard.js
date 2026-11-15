import React from 'react';
export default function Dashboard({ data }) {
  return (
    <div style={{ width: '50%', padding: '20px' }}>
      <h2>Vulnerability: {data.vulnerability}</h2>
      <h3>Recommended Strategies:</h3>
      <ul>
        {data.strategies.map((s, i) => (
          <li key={i}><strong>{s.name}</strong> - Score: {s.score} <br/> {s.reason}</li>
        ))}
      </ul>
    </div>
  );
}