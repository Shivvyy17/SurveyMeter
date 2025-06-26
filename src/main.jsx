// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ParticipantPanel from './components/ParticipantPanel.jsx';
import ManualParticipantEntry from './components/ManualParticipantEntry.jsx';
import Layout from './components/Layout.jsx';
import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Layout><App /></Layout>} />
        <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
        <Route path="/participant/manual" element={<Layout><ManualParticipantEntry /></Layout>} />
        <Route path="/participant/:surveyId" element={<Layout><ParticipantPanel /></Layout>} />
      </Routes>
    </Router>
  </React.StrictMode>
);
