// src/pages/SurveySharePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { surveyAPI } from '../utils/apiClient';
import '../styles/SurveyShare.css';

// NOTE: Make sure qrcode.react is installed
// Run: npm install qrcode.react

export default function SurveySharePage() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const qrRef = useRef(null);
  
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState({ code: false, link: false });

  useEffect(() => {
    fetchSurvey();
    // Refresh response count every 5 seconds
    const interval = setInterval(fetchSurvey, 5000);
    return () => clearInterval(interval);
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const response = await surveyAPI.getById(surveyId);
      setSurvey(response.data.survey);
      setError('');
    } catch (err) {
      setError('Failed to load survey');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const surveyUrl = `${window.location.origin}/student/survey/${survey?.code}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    });
  };

  const downloadQRCode = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `survey-${survey.code}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const printQRCode = () => {
    window.print();
  };

  if (loading) {
    return <div className="share-loading">Loading survey...</div>;
  }

  if (error || !survey) {
    return (
      <div className="share-error">
        <p>{error || 'Survey not found'}</p>
        <button onClick={() => navigate('/teacher/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="share-container">
      {/* Header */}
      <header className="share-header">
        <button className="back-btn" onClick={() => navigate('/teacher/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Share Survey</h1>
      </header>

      {/* Main Content */}
      <div className="share-content">
        {/* Survey Info Card */}
        <div className="share-card info-card">
          <h2>{survey.title}</h2>
          <div className="survey-meta">
            <div className="meta-item">
              <span className="meta-label">📋 Questions:</span>
              <span className="meta-value">{survey.questions.length}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">👥 Responses:</span>
              <span className="meta-value live-count">{survey.responses?.length || 0}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">📅 Created:</span>
              <span className="meta-value">
                {new Date(survey.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Survey Code Card */}
        <div className="share-card code-card">
          <h3>Survey Code</h3>
          <div className="code-display">
            <span className="code-number">{survey.code}</span>
          </div>
          <button
            className={`copy-btn ${copied.code ? 'copied' : ''}`}
            onClick={() => copyToClipboard(survey.code, 'code')}
          >
            {copied.code ? '✓ Copied!' : '📋 Copy Code'}
          </button>
          <p className="code-instruction">
            Students can enter this code at: <strong>{window.location.origin}/student/join</strong>
          </p>
        </div>

        {/* QR Code Card */}
        <div className="share-card qr-card" ref={qrRef}>
          <h3>QR Code</h3>
          <div className="qr-code-wrapper">
            <QRCodeSVG
              value={surveyUrl}
              size={280}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="qr-instruction">Students can scan this to access the survey directly</p>
          <div className="qr-actions">
            <button className="qr-action-btn" onClick={downloadQRCode}>
              💾 Download QR
            </button>
            <button className="qr-action-btn" onClick={printQRCode}>
              🖨️ Print QR
            </button>
          </div>
        </div>

        {/* Shareable Link Card */}
        <div className="share-card link-card">
          <h3>Direct Link</h3>
          <div className="link-display">
            <input
              type="text"
              value={surveyUrl}
              readOnly
              onClick={(e) => e.target.select()}
            />
          </div>
          <button
            className={`copy-btn ${copied.link ? 'copied' : ''}`}
            onClick={() => copyToClipboard(surveyUrl, 'link')}
          >
            {copied.link ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <p className="link-instruction">
            Share this link via email, messaging apps, or social media
          </p>
        </div>

        {/* Action Buttons */}
        <div className="share-actions">
          <button
            className="action-btn primary"
            onClick={() => navigate(`/teacher/results/${surveyId}`)}
          >
            📊 View Results
          </button>
          <button
            className="action-btn secondary"
            onClick={() => navigate('/teacher/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="instructions-section">
        <h3>📱 How to Share This Survey</h3>
        <div className="instruction-grid">
          <div className="instruction-item">
            <span className="instruction-icon">1️⃣</span>
            <div className="instruction-text">
              <h4>Share the Code</h4>
              <p>Tell students to go to the survey website and enter code: <strong>{survey.code}</strong></p>
            </div>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">2️⃣</span>
            <div className="instruction-text">
              <h4>Share the QR Code</h4>
              <p>Display the QR code on screen or print it. Students scan with their phone camera.</p>
            </div>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">3️⃣</span>
            <div className="instruction-text">
              <h4>Share the Link</h4>
              <p>Send the direct link via email, WhatsApp, or any messaging platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="live-status">
        <span className="status-indicator"></span>
        <span className="status-text">Live • Auto-refreshing every 5 seconds</span>
      </div>
    </div>
  );
}