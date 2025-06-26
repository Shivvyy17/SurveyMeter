// components/ManualParticipantEntry.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ManualParticipantEntry() {
  const [surveyId, setSurveyId] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (surveyId.trim()) {
      navigate(`/participant/${surveyId.trim()}`);
    }
  }

  return (
    <div className="manual-entry-form">
      <h2>Enter Survey ID</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={surveyId}
          onChange={(e) => setSurveyId(e.target.value)}
          placeholder="Paste survey ID here"
          required
        />
        <button type="submit">Join Survey</button>
      </form>
    </div>
  );
}
