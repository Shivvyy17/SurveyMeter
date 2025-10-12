// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    }
  }, [token, user, navigate]);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">📊 SurveyMeter</h1>
        <p className="home-subtitle">Create surveys and collect responses effortlessly</p>

        <div className="home-buttons">
          <button 
            className="home-button primary" 
            onClick={() => navigate('/login')}
          >
            👤 Login
          </button>
          <button 
            className="home-button secondary" 
            onClick={() => navigate('/register')}
          >
            ➕ Register as Teacher
          </button>
        </div>

        <div className="home-divider">Or</div>

        <button 
          className="home-button tertiary" 
          onClick={() => navigate('/student/join')}
        >
          🎯 Take a Survey
        </button>

        <div className="home-features">
          <div className="feature">
            <span className="feature-icon">✅</span>
            <p>Teachers create surveys with custom questions</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <p>Students join with survey code or QR scan</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📈</span>
            <p>View live results with beautiful charts</p>
          </div>
        </div>
      </div>
    </div>
  );
}