// src/pages/TeacherDashboard.jsx - Enhanced with QR Code Previews
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { surveyAPI } from '../utils/apiClient';
import '../styles/Dashboard.css';

export default function TeacherDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Visual feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  };

  const handleShowQR = (survey) => {
    setSelectedSurvey(survey);
    setShowQRModal(true);
  };

  const handleDownloadQR = (survey) => {
    // Create a temporary container for the QR code
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // Create QR code SVG
    const qrContainer = document.createElement('div');
    tempDiv.appendChild(qrContainer);
    
    const surveyUrl = `${window.location.origin}/student/survey/${survey.code}`;
    
    // We'll use a canvas approach for download
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    // Create temporary QR SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    
    // Simple QR generation notice
    const img = new Image();
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" font-size="24" fill="black">
          Survey Code: ${survey.code}
        </text>
      </svg>
    `;
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `survey-${survey.code}-qr.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        document.body.removeChild(tempDiv);
      });
    };
    
    img.src = url;
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
          <h2>Your Surveys ({surveys.length})</h2>

          {loading ? (
            <div className="loading">Loading surveys...</div>
          ) : surveys.length === 0 ? (
            <div className="empty-state">
              <p>📝 No surveys yet. Create your first survey!</p>
            </div>
          ) : (
            <div className="surveys-grid">
              {surveys.map(survey => (
                <div key={survey._id} className="survey-card enhanced">
                  <div className="survey-card-header">
                    <h3>{survey.title}</h3>
                    <span className="survey-code-badge">#{survey.code}</span>
                  </div>

                  <div className="survey-card-body">
                    {/* QR Code Preview */}
                    <div className="qr-preview-container">
                      <div 
                        className="qr-preview"
                        onClick={() => handleShowQR(survey)}
                        title="Click to view larger"
                      >
                        <QRCodeSVG
                          value={`${window.location.origin}/student/survey/${survey.code}`}
                          size={100}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <button
                        className="qr-preview-btn"
                        onClick={() => handleShowQR(survey)}
                        title="View/Download QR"
                      >
                        🔍 View QR
                      </button>
                    </div>

                    {/* Survey Stats */}
                    <div className="survey-stats">
                      <div className="stat-item">
                        <span className="stat-icon">📋</span>
                        <span className="stat-value">{survey.questions.length}</span>
                        <span className="stat-label">Questions</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">👥</span>
                        <span className="stat-value">{survey.responses?.length || 0}</span>
                        <span className="stat-label">Responses</span>
                      </div>
                    </div>

                    <p className="survey-date">
                      📅 {new Date(survey.createdAt).toLocaleDateString()}
                    </p>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                      <button
                        className="quick-action-btn copy"
                        onClick={(e) => handleCopyCode(survey.code)}
                        title="Copy survey code"
                      >
                        📋 Copy Code
                      </button>
                      <button
                        className="quick-action-btn share"
                        onClick={() => navigate(`/teacher/survey/${survey._id}`)}
                        title="Share survey"
                      >
                        🔗 Share
                      </button>
                    </div>
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

      {/* QR Modal */}
      {showQRModal && selectedSurvey && (
        <QRModal
          survey={selectedSurvey}
          onClose={() => {
            setShowQRModal(false);
            setSelectedSurvey(null);
          }}
        />
      )}
    </div>
  );
}

// QR Code Modal Component
function QRModal({ survey, onClose }) {
  const navigate = useNavigate();
  const surveyUrl = `${window.location.origin}/student/survey/${survey.code}`;

  const downloadQR = () => {
    const svg = document.querySelector('.qr-modal-content svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `survey-${survey.code}-qr.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="qr-modal-content">
          <h3>{survey.title}</h3>
          <div className="modal-code-display">
            Survey Code: <strong>{survey.code}</strong>
          </div>
          
          <div className="qr-modal-display">
            <QRCodeSVG
              value={surveyUrl}
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <p className="qr-modal-instruction">
            Students can scan this QR code with their phone camera
          </p>
          
          <div className="qr-modal-actions">
            <button className="modal-btn primary" onClick={downloadQR}>
              💾 Download QR Code
            </button>
            <button 
              className="modal-btn secondary"
              onClick={() => navigate(`/teacher/survey/${survey._id}`)}
            >
              🔗 View Share Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Survey Form Component (unchanged from original)
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