import axios from 'axios';

const API_URL = 'http://localhost:3002';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const coursesAPI = {
  getAllCourses: () => api.get('/api/courses'),
  getCourseById: (id) => api.get(`/api/courses/${id}`),
  enrollCourse: (courseId) => api.post(`/api/courses/${courseId}/enroll`),
};

export default api;
