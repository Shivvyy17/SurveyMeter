// src/pages/StudentJoinPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentJoin.css';

export default function StudentJoinPage() {
  const [surveyCode, setSurveyCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!surveyCode.trim()) {
      setError('Please enter a survey code');
      return;
    }

    // Code should be 4-6 digits
    if (!/^\d{4,6}$/.test(surveyCode.trim())) {
      setError('Survey code should be 4-6 digits (e.g., 123456)');
      return;
    }

    // Navigate to survey response page with code
    navigate(`/student/survey/${surveyCode.trim()}`);
  };

  return (
    <div className="student-join-container">
      <div className="student-join-card">
        <h1>📊 SurveyMeter</h1>
        <h2>Join a Survey</h2>

        <div className="join-form-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="code">Enter Survey Code</label>
              <input
                type="text"
                id="code"
                value={surveyCode}
                onChange={(e) => setSurveyCode(e.target.value.toUpperCase())}
                placeholder="e.g., 123456"
                maxLength="6"
                autoComplete="off"
              />
              <p className="code-hint">You'll find this code in your invitation or QR code</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="join-button">
              Join Survey →
            </button>
          </form>

          <div className="divider">or</div>

          <button
            className="qr-button"
            onClick={() => navigate('/student/qr-scanner')}
          >
            📱 Scan QR Code
          </button>
        </div>

        <div className="info-box">
          <p>💡 No account needed! Just enter your name when taking the survey.</p>
        </div>
      </div>
    </div>
  );
}