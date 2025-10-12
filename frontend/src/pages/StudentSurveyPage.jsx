// src/pages/StudentSurveyPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyAPI } from '../utils/apiClient';
import '../styles/StudentSurvey.css';

export default function StudentSurveyPage() {
  const { surveyCode } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNameForm, setShowNameForm] = useState(true);

  useEffect(() => {
    fetchSurvey();
  }, [surveyCode]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getByCode(surveyCode);
      setSurvey(response.data.survey);
      setAnswers(Array(response.data.survey.questions.length).fill(''));
      setError('');
    } catch (err) {
      setError('Survey not found. Please check the code and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Please enter your name');
      return;
    }
    setShowNameForm(false);
  };

  const handleAnswerChange = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      alert('Please select an answer before proceeding');
      return;
    }

    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check all answers are filled
    if (answers.some(a => !a)) {
      alert('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      await surveyAPI.submit(surveyCode, {
        studentName,
        answers,
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit survey. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="survey-loading">Loading survey...</div>;
  }

  if (error && !survey) {
    return (
      <div className="survey-error">
        <p>{error}</p>
        <button onClick={() => navigate('/student/join')}>Back to Join</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="survey-container">
        <div className="survey-success">
          <div className="success-icon">✅</div>
          <h2>Thank You!</h2>
          <p>Your response has been recorded successfully.</p>
          <button onClick={() => navigate('/student/join')}>
            Take Another Survey
          </button>
        </div>
      </div>
    );
  }

  if (showNameForm) {
    return (
      <div className="survey-container">
        <div className="name-form-card">
          <h1>📊 {survey.title}</h1>
          <form onSubmit={handleNameSubmit}>
            <div className="form-group">
              <label>What's your name?</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
              />
            </div>
            <button type="submit" className="btn-continue">
              Continue →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const q = survey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

  return (
    <div className="survey-container">
      <div className="survey-card">
        {/* Header */}
        <div className="survey-header">
          <div>
            <h1>{survey.title}</h1>
            <p className="respondent-name">Respondent: <strong>{studentName}</strong></p>
          </div>
          <div className="survey-progress">
            <span className="progress-text">
              {currentQuestion + 1} of {survey.questions.length}
            </span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="survey-content">
          <h2 className="question-title">
            Question {currentQuestion + 1}
          </h2>
          <p className="question-text">{q.questionText}</p>

          {/* Options */}
          <div className="options-container">
            {q.options.map((option, idx) => (
              <label key={idx} className="option-label">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleAnswerChange(option)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="survey-navigation">
          <button
            className="btn-nav btn-prev"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion === survey.questions.length - 1 ? (
            <button
              className="btn-nav btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Survey ✓'}
            </button>
          ) : (
            <button
              className="btn-nav btn-next"
              onClick={handleNext}
            >
              Next →
            </button>
          )}
        </div>

        {/* Question Indicators */}
        <div className="question-indicators">
          {survey.questions.map((_, idx) => (
            <div
              key={idx}
              className={`indicator ${
                idx === currentQuestion
                  ? 'active'
                  : answers[idx]
                  ? 'answered'
                  : 'unanswered'
              }`}
              title={`Question ${idx + 1}${answers[idx] ? ' (answered)' : ''}`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}