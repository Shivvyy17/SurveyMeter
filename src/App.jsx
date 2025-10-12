import React from 'react';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="app-container">
      <h1>Survey Meter</h1>
      <div className='mode-button-group'>
        <Link to="/admin">
          <button className="mode-button">Admin Login</button>
        </Link>
      </div>
      <div className='mode-button-group'>
        <Link to="/participant/manual">
          <button className="mode-button">Participant Login</button>
        </Link>
      </div>
    </div>
  );
}


