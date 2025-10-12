// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/apiClient';
import '../styles/Dashboard.css';

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTeachers();
      setTeachers(response.data.teachers);
      setError('');
    } catch (err) {
      setError('Failed to load teachers');
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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📊 SurveyMeter</h1>
          <p>Admin Dashboard</p>
        </div>
        <div className="header-right">
          <span className="user-greeting">Admin: {user.name}! 👑</span>
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
            {showCreateForm ? '✕ Cancel' : '+ Create Teacher Account'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={fetchTeachers}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Create Teacher Form */}
        {showCreateForm && (
          <CreateTeacherForm 
            onSuccess={() => {
              setShowCreateForm(false);
              fetchTeachers();
            }}
          />
        )}

        {/* Teachers List */}
        <div className="surveys-section">
          <h2>Teachers ({teachers.length})</h2>
          
          {loading ? (
            <div className="loading">Loading teachers...</div>
          ) : teachers.length === 0 ? (
            <div className="empty-state">
              <p>👨‍🏫 No teachers yet. Create your first teacher account!</p>
            </div>
          ) : (
            <div className="teachers-table">
              <div className="table-header">
                <div className="table-col col-name">Name</div>
                <div className="table-col col-email">Email</div>
                <div className="table-col col-date">Created</div>
                <div className="table-col col-actions">Actions</div>
              </div>

              {teachers.map((teacher) => (
                <div key={teacher._id} className="table-row">
                  <div className="table-col col-name">
                    <span className="teacher-name">{teacher.name}</span>
                  </div>
                  <div className="table-col col-email">
                    <span className="teacher-email">{teacher.email}</span>
                  </div>
                  <div className="table-col col-date">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </div>
                  <div className="table-col col-actions">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => alert('Edit feature coming soon')}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteTeacher(teacher._id)}
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

  async function handleDeleteTeacher(teacherId) {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await adminAPI.deleteTeacher(teacherId);
        setTeachers(teachers.filter(t => t._id !== teacherId));
      } catch (err) {
        setError('Failed to delete teacher');
      }
    }
  }
}

// Create Teacher Form Component
function CreateTeacherForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.createTeacher(formData);
      onSuccess();
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-survey-form">
      <h3>Create New Teacher Account</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Mrs. Smith"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g., smith@school.com"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter initial password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Creating...' : 'Create Teacher'}
      </button>
    </form>
  );
}