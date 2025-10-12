import React, { useState } from 'react';
import '../styles/App.css';

function createEmptyQuestion() {
  return {
    id: crypto.randomUUID(),
    questionText: '',
    options: ['', ''],
  };
}

export default function SurveyForm({ onSave }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([createEmptyQuestion()]);

  function handleQuestionChange(id, field, value) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  }

  function handleOptionChange(qid, idx, value) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid
          ? {
            ...q,
            options: q.options.map((opt, i) => (i === idx ? value : opt)),
          }
          : q
      )
    );
  }

  function addOption(qid) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid ? { ...q, options: [...q.options, ''] } : q
      )
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, createEmptyQuestion()]);
  }

  function handleSubmit(e) {
    e.preventDefault();

    for (const q of questions) {
      if (!q.questionText.trim()) {
        alert('Please enter all question texts.');
        return;
      }
      if (q.options.length < 2 || q.options.some((opt) => !opt.trim())) {
        alert('Each question must have at least 2 valid options.');
        return;
      }
    }

    onSave({
      id: crypto.randomUUID(),
      title,
      questions,
      responses: [],
    });

    setTitle('');
    setQuestions([createEmptyQuestion()]);
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <label className="section-title">
        Survey Title:
        <input
          className="survey-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      {questions.map((q, qIdx) => (
        <div key={q.id} className="question-block">
          <input
            className="question-input"
            type="text"
            placeholder={`Question ${qIdx + 1}`}
            value={q.questionText}
            onChange={(e) =>
              handleQuestionChange(q.id, 'questionText', e.target.value)
            }
            required
          />
          <div className="options-list">
            {q.options.map((opt, i) => (
              <input
                key={i}
                className="option-field"
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(q.id, i, e.target.value)}
                required
              />
            ))}
            <button
              type="button"
              onClick={() => addOption(q.id)}
              className="add-option"
            >
              + Add Option
            </button>
          </div>
        </div>
      ))}

      <div className="buttons">
        <button type="button" onClick={addQuestion}>
          + Add Question
        </button>
        <button type="submit">Save Survey</button>
      </div>
    </form>
  );
}
