// src/pages/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyAPI } from '../utils/apiClient';
import '../styles/Dashboard.css';

export default function TeacherDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getAll();
      setSurveys(response.data.surveys);
      setError('');
    } catch (err) {
      setError('Failed to load surveys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDelete = async (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await surveyAPI.delete(surveyId);
        setSurveys(surveys.filter(s => s._id !== surveyId));
      } catch (err) {
        setError('Failed to delete survey');
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📊 SurveyMeter</h1>
          <p>Teacher Dashboard</p>
        </div>
        <div className="header-right">
          <span className="user-greeting">Welcome, {user.name}! 👋</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Action Buttons */}
        <div className="action-bar">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Cancel' : '+ Create New Survey'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={fetchSurveys}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Create Form */}
        {showCreateForm && (
          <CreateSurveyForm
            onSuccess={() => {
              setShowCreateForm(false);
              fetchSurveys();
            }}
          />
        )}

        {/* Surveys List */}
        <div className="surveys-section">
          <h2>Your Surveys</h2>

          {loading ? (
            <div className="loading">Loading surveys...</div>
          ) : surveys.length === 0 ? (
            <div className="empty-state">
              <p>📝 No surveys yet. Create your first survey!</p>
            </div>
          ) : (
            <div className="surveys-grid">
              {surveys.map(survey => (
                <div key={survey._id} className="survey-card">
                  <div className="survey-card-header">
                    <h3>{survey.title}</h3>
                    <span className="survey-code">Code: {survey.code}</span>
                  </div>

                  <div className="survey-card-body">
                    <p className="survey-questions">
                      📋 {survey.questions.length} questions
                    </p>
                    <p className="survey-responses">
                      👥 {survey.responses?.length || 0} responses
                    </p>
                    <p className="survey-date">
                      📅 {new Date(survey.createdAt).toLocaleDateString()}
                    </p>

                    {/* ← Add this: Copy code to clipboard */}
                    <button
                      className="btn-copy-code"
                      onClick={() => {
                        navigator.clipboard.writeText(survey.code);
                        alert('Code copied: ' + survey.code);
                      }}
                    >
                      📋 Copy Code
                    </button>
                  </div>

                  <div className="survey-card-actions">
                    <button
                      className="btn-icon btn-results"
                      onClick={() => navigate(`/teacher/results/${survey._id}`)}
                      title="View Results"
                    >
                      📊 Results
                    </button>
                    <button
                      className="btn-icon btn-share"
                      onClick={() => navigate(`/teacher/survey/${survey._id}`)}
                      title="Share Survey"
                    >
                      🔗 Share
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(survey._id)}
                      title="Delete Survey"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Survey Form Component
function CreateSurveyForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', ''] }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', ''] }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
      setQuestions(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Survey title is required');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      if (q.options.filter(o => o.trim()).length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        return;
      }
    }

    try {
      setLoading(true);
      await surveyAPI.create({
        title,
        questions: questions.map(q => ({
          questionText: q.questionText,
          options: q.options.filter(o => o.trim()),
        })),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-survey-form">
      <h3>Create New Survey</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Survey Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Math Quiz, Customer Feedback"
        />
      </div>

      <div className="questions-section">
        <h4>Questions</h4>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-block">
            <div className="question-header">
              <label>Question {qIndex + 1}</label>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="btn-small btn-danger"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="text"
              value={q.questionText}
              onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
              placeholder="Enter question text"
              className="question-input"
            />

            <div className="options-section">
              <label>Options</label>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="option-input-group">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(qIndex, oIndex)}
                      className="btn-icon-small btn-danger"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddOption(qIndex)}
                className="btn-small btn-secondary"
              >
                + Add Option
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddQuestion}
        className="btn btn-secondary"
      >
        + Add Question
      </button>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Creating...' : 'Create Survey'}
      </button>
    </form>
  );
}