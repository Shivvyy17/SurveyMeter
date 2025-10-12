// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SurveyResultsPage from './pages/SurveyResultsPage.jsx';
import StudentJoinPage from './pages/StudentJoinPage.jsx';
import StudentSurveyPage from './pages/StudentSurveyPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './index.css';
import './styles/Auth.css';
import './styles/Home.css';
import './styles/Dashboard.css';
import './styles/Results.css';
import './styles/StudentJoin.css';
import './styles/StudentSurvey.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/student/join" element={<StudentJoinPage />} />
        <Route path="/student/survey/:surveyCode" element={<StudentSurveyPage />} />

        {/* Protected Routes - Teacher */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/results/:surveyId"
          element={
            <ProtectedRoute requiredRole="teacher">
              <SurveyResultsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>
);