import React, { useState, useEffect } from 'react';
import SurveyForm from './SurveyForm';
import SurveyResults from './SurveyResults';
import { loadSurveys, saveSurveys } from '../utils/storage';
import '../app.css';

export default function AdminPanel({ onSelectSurvey }) {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);

  useEffect(() => {
    const loaded = loadSurveys();
    if (loaded) setSurveys(loaded);
  }, []);

  function handleSaveSurvey(newSurvey) {
    const updatedSurveys = [...surveys, newSurvey];
    setSurveys(updatedSurveys);
    saveSurveys(updatedSurveys);
  }

  function handleSelectSurvey(id) {
    setSelectedSurveyId(id);
    onSelectSurvey?.(id); // Optional chaining in case not passed
  }

  const getSurveyLink = (id) => `${window.location.origin}/participant/${id}`;

  return (
    <div className="container">
      <div className="section-title">Create New Survey</div>
      <SurveyForm onSave={handleSaveSurvey} />

      <div className="section-title">Saved Surveys</div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {surveys.map((survey) => (
         <li key={survey.id} className="saved-survey-card">
           <div className="survey-info">
            <h4>{survey.title || `Survey ${survey.id}`}</h4>
            <p>Survey Code: <code>{survey.id}</code></p>
           </div>
           <div className="survey-actions">
             <button onClick={() => handleSelectSurvey(survey.id)} className="result-btn">
               View Results
              </button>
           </div>
          </li>

        ))}
      </ul>

      {selectedSurveyId && (
        <SurveyResults survey={surveys.find((s) => s.id === selectedSurveyId)} />
      )}
    </div>
  );
}

