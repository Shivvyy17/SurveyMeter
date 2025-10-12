// src/utils/apiClient.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  verify: () => apiClient.get('/auth/verify'),
  logout: () => apiClient.post('/auth/logout'),
};

// Survey endpoints
export const surveyAPI = {
  create: (data) => apiClient.post('/surveys', data),
  getAll: () => apiClient.get('/surveys'),
  getById: (id) => apiClient.get(`/surveys/${id}`),
  getByCode: (code) => apiClient.get(`/surveys/${code}`),
  submit: (code, data) => apiClient.post(`/surveys/${code}/submit`, data),
  getResults: (id) => apiClient.get(`/surveys/${id}/results`),
  delete: (id) => apiClient.delete(`/surveys/${id}`),
};

// Admin endpoints
export const adminAPI = {
  getTeachers: () => apiClient.get('/admin/teachers'),
  createTeacher: (data) => apiClient.post('/admin/teachers', data),
  updateTeacher: (id, data) => apiClient.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => apiClient.delete(`/admin/teachers/${id}`),
};

export default apiClient;