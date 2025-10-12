// src/pages/SurveyResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyAPI } from '../utils/apiClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import '../styles/Results.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'];

export default function SurveyResultsPage() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [surveyId]);

  const fetchResults = async () => {
    try {
      const response = await surveyAPI.getResults(surveyId);
      setSurvey(response.data.survey);
      setError('');
    } catch (err) {
      setError('Failed to load results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="results-loading">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="results-error">
        <p>{error}</p>
        <button onClick={() => navigate('/teacher/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="results-error">
        <p>Survey not found</p>
        <button onClick={() => navigate('/teacher/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="results-container">
      {/* Header */}
      <header className="results-header">
        <div className="results-header-content">
          <button 
            className="back-btn"
            onClick={() => navigate('/teacher/dashboard')}
          >
            ← Back
          </button>
          <div>
            <h1>{survey.title}</h1>
            <p>Survey Code: <span className="survey-code">{survey.code}</span></p>
          </div>
        </div>
        <div className="response-count">
          <span className="count-number">{survey.totalResponses}</span>
          <span className="count-label">Responses</span>
        </div>
      </header>

      {/* Results Content */}
      <div className="results-content">
        {survey.totalResponses === 0 ? (
          <div className="no-responses">
            <p>📊 No responses yet. Share your survey code to start collecting responses!</p>
            <div className="share-info">
              <p>Survey Code: <strong>{survey.code}</strong></p>
              <p>Share this code with students to let them respond to your survey.</p>
            </div>
          </div>
        ) : (
          <div className="questions-results">
            {survey.stats.map((stat, idx) => (
              <div key={idx} className="result-question-card">
                <h3>
                  <span className="question-number">Q{idx + 1}</span>
                  {stat.questionText}
                </h3>

                {/* Stats Table */}
                <div className="stats-table">
                  <div className="table-header">
                    <div className="table-cell">Option</div>
                    <div className="table-cell">Votes</div>
                    <div className="table-cell">Percentage</div>
                  </div>
                  {stat.options.map((option, oIdx) => {
                    const votes = stat.counts[option] || 0;
                    const percentage = survey.totalResponses > 0 
                      ? ((votes / survey.totalResponses) * 100).toFixed(1)
                      : 0;
                    return (
                      <div key={oIdx} className="table-row">
                        <div className="table-cell">{option}</div>
                        <div className="table-cell votes">{votes}</div>
                        <div className="table-cell percentage">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart */}
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={stat.options.map((opt) => ({
                        option: opt,
                        votes: stat.counts[opt] || 0,
                      }))}
                      margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="option"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="votes" fill="#667eea" radius={[8, 8, 0, 0]}>
                        {stat.options.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="results-footer">
        <p>💡 This page auto-refreshes every 5 seconds</p>
      </footer>
    </div>
  );
}