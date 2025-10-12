import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');
  const isParticipant = location.pathname.startsWith('/participant');

  const toggleMode = () => {
    if (isAdmin) navigate('/participant/manual');
    else if (isParticipant) navigate('/admin');
    else navigate('/');
  };

  return (
    <div className="app-container">
      {(isAdmin || isParticipant) && (
        <button className="top-right-toggle" onClick={toggleMode}>
          Switch to {isAdmin ? 'Participant' : 'Admin'} Mode
        </button>
      )}
      {children}
    </div>
  );
}
