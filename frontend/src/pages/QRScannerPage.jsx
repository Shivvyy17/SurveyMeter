// src/pages/QRScannerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/QRScanner.css';

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      setHasPermission(result.state === 'granted');
      
      if (result.state === 'granted') {
        await getCameraDevices();
      }
      
      result.addEventListener('change', () => {
        setHasPermission(result.state === 'granted');
      });
    } catch (err) {
      console.log('Permission API not supported, will request directly');
      setHasPermission(null);
    }
  };

  const getCameraDevices = async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Try to find rear camera first (for mobile)
      const rearCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      setSelectedDevice(rearCamera?.deviceId || videoDevices[0]?.deviceId || '');
    } catch (err) {
      console.error('Error getting camera devices:', err);
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      const constraints = {
        video: {
          facingMode: 'environment', // Prefer rear camera on mobile
          ...(selectedDevice && { deviceId: { exact: selectedDevice } })
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();

        setHasPermission(true);

        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          startQRDetection();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setScanning(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
        setHasPermission(false);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please check your browser settings.');
      }
    }
  };

  const stopScanning = () => {
    setScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startQRDetection = () => {
    if (!('BarcodeDetector' in window)) {
      setError('QR code scanning is not supported in this browser. Please use Chrome or Safari, or enter the code manually.');
      stopScanning();
      setShowManualInput(true);
      return;
    }

    const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue;
            handleQRCodeDetected(qrData);
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }
    }, 300); // Scan every 300ms
  };

  const handleQRCodeDetected = (data) => {
    stopScanning();
    
    // Extract survey code from URL or use directly
    let surveyCode = data;
    
    // If it's a URL, extract the code
    if (data.includes('/student/survey/')) {
      const parts = data.split('/student/survey/');
      surveyCode = parts[1]?.split(/[/?#]/)[0]; // Get code before any query params
    }
    
    // Validate it's a 6-digit code
    if (/^\d{4,6}$/.test(surveyCode)) {
      // Success! Navigate to survey
      navigate(`/student/survey/${surveyCode}`);
    } else {
      setError(`Invalid survey code detected: ${surveyCode}. Please try again or enter manually.`);
      setShowManualInput(true);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      setError('Please enter a survey code');
      return;
    }

    if (!/^\d{4,6}$/.test(manualCode.trim())) {
      setError('Survey code should be 4-6 digits');
      return;
    }

    navigate(`/student/survey/${manualCode.trim()}`);
  };

  return (
    <div className="qr-scanner-container">
      <div className="scanner-content">
        {/* Header */}
        <div className="scanner-header">
          <button className="back-btn" onClick={() => navigate('/student/join')}>
            ← Back
          </button>
          <h1>📱 Scan QR Code</h1>
        </div>

        {/* Camera Permission Request */}
        {hasPermission === false && (
          <div className="permission-denied">
            <div className="permission-icon">📷</div>
            <h2>Camera Access Required</h2>
            <p>We need your permission to access the camera to scan QR codes.</p>
            <button className="permission-btn" onClick={startScanning}>
              Allow Camera Access
            </button>
          </div>
        )}

        {/* Camera View */}
        {hasPermission !== false && !showManualInput && (
          <div className="scanner-view">
            {!scanning ? (
              <div className="scan-placeholder">
                <div className="placeholder-icon">📸</div>
                <h2>Ready to Scan</h2>
                <p>Point your camera at the survey QR code</p>
                
                {devices.length > 1 && (
                  <div className="camera-selector">
                    <label>Select Camera:</label>
                    <select 
                      value={selectedDevice} 
                      onChange={(e) => setSelectedDevice(e.target.value)}
                    >
                      {devices.map((device, idx) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <button className="start-scan-btn" onClick={startScanning}>
                  Start Scanning
                </button>
              </div>
            ) : (
              <div className="video-container">
                <video ref={videoRef} className="scanner-video" playsInline />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {/* Scanning Overlay */}
                <div className="scan-overlay">
                  <div className="scan-frame">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                    <div className="scan-line"></div>
                  </div>
                </div>
                
                <div className="scan-instructions">
                  <p>📱 Position the QR code within the frame</p>
                </div>

                <button className="stop-scan-btn" onClick={stopScanning}>
                  Stop Scanning
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="scanner-error">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Manual Input Alternative */}
        <div className="manual-input-section">
          {!showManualInput ? (
            <button 
              className="show-manual-btn"
              onClick={() => setShowManualInput(true)}
            >
              Can't scan? Enter code manually
            </button>
          ) : (
            <div className="manual-input-form">
              <h3>Enter Survey Code</h3>
              <form onSubmit={handleManualSubmit}>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g., 123456"
                  maxLength="6"
                  autoFocus
                />
                <button type="submit" className="submit-code-btn">
                  Join Survey
                </button>
              </form>
              <button 
                className="hide-manual-btn"
                onClick={() => setShowManualInput(false)}
              >
                ← Back to Scanner
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="scanner-info">
          <h3>💡 How to Scan</h3>
          <div className="info-steps">
            <div className="info-step">
              <span className="step-number">1</span>
              <p>Allow camera access when prompted</p>
            </div>
            <div className="info-step">
              <span className="step-number">2</span>
              <p>Point your camera at the QR code</p>
            </div>
            <div className="info-step">
              <span className="step-number">3</span>
              <p>Hold steady until it's detected</p>
            </div>
          </div>
        </div>

        {/* Browser Support Notice */}
        <div className="browser-notice">
          <p>📌 <strong>Note:</strong> QR scanning works best in Chrome or Safari. If you're having trouble, try entering the code manually.</p>
        </div>
      </div>
    </div>
  );
}