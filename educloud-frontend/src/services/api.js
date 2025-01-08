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

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }

    // Handle specific HTTP errors
    switch (error.response.status) {
      case 401:
        // Clear storage on unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;
      case 403:
        error.message = 'You do not have permission to perform this action.';
        break;
      case 404:
        error.message = 'The requested resource was not found.';
        break;
      case 500:
        error.message = 'An internal server error occurred. Please try again later.';
        break;
      default:
        error.message = error.response.data.message || 'An unexpected error occurred.';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/users/login', credentials);
      // Verify the response contains the expected data
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/api/users/signup', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const coursesAPI = {
  getAllCourses() {
    return api.get('/api/courses');
  },
  getCourseById(id) {
    return api.get(`/api/courses/${id}`);
  },
  enrollCourse(courseId) {
    return api.post(`/api/courses/${courseId}/enroll`);
  },
  getEnrolledCourses() {
    return api.get('/api/courses/enrolled');
  }
  // getAllCourses: () => api.get('/api/courses'),
  // getCourseById: (id) => api.get(`/api/courses/${id}`),
  // enrollCourse: (courseId) => api.post(`/api/enrollments`, { courseId }),
};

export default api;
