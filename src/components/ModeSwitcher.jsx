import React from 'react';

export default function ModeSwitcher({ mode, setMode }) {
  return (
    <div className="mode-switcher">
      <button
        className={mode === 'admin' ? 'active' : ''}
        onClick={() => setMode('admin')}
      >
        Admin
      </button>
      <button
        className={mode === 'participant' ? 'active' : ''}
        onClick={() => setMode('participant')}
      >
        Participant
      </button>
    </div>
  );
}
