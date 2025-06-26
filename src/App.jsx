// App.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="app-container">
      <h1>Survey Meter</h1>
      <p>Select a mode to continue:</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/admin">
          <button className="mode-button">Admin Mode</button>
        </Link>
        <Link to="/participant/manual">
          <button className="mode-button">Participant Mode</button>
        </Link>
      </div>
    </div>
  );
}


