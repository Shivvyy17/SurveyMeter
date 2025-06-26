// components/ParticipantPanel.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadSurveys, saveSurveys } from '../utils/storage';

export default function ParticipantPanel() {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const surveys = loadSurveys();
    const found = surveys.find((s) => s.id === surveyId);
    if (found) {
      setSurvey(found);
      setAnswers(Array(found.questions.length).fill(''));
      setSubmitted(false);
      setCurrentQuestionIndex(0);
    }
  }, [surveyId]);

  if (!survey) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Survey not found or invalid link 😢</p>;

  function handleAnswerChange(e) {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (!answers[currentQuestionIndex]) {
      alert('Please select an option.');
      return;
    }

    if (currentQuestionIndex + 1 < survey.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const surveys = loadSurveys();
      const surveyIndex = surveys.findIndex((s) => s.id === surveyId);
      surveys[surveyIndex].responses.push({ answers });
      saveSurveys(surveys);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="app-container">
        <h2>Thank you! ✅</h2>
        <p>Your response has been recorded.</p>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  return (
    <div className="app-container">
      <h2>{survey.title}</h2>
      <div className="question-block">
        <h3>
          Question {currentQuestionIndex + 1} / {survey.questions.length}
        </h3>
        <p>{currentQuestion.questionText}</p>
        <div className="options-list">
          {currentQuestion.options.map((opt, idx) => (
            <label key={idx} className="option-label">
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={opt}
                checked={answers[currentQuestionIndex] === opt}
                onChange={handleAnswerChange}
              />
              {opt}
            </label>
          ))}
        </div>

        <button onClick={handleNext} className="next-btn">
          {currentQuestionIndex + 1 === survey.questions.length
            ? 'Submit'
            : 'Next'}
        </button>
      </div>
    </div>
  );
}
