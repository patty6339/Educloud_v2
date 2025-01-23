import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

// Helper function to get full thumbnail URL
export const getThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath) return '/default-course.jpg';
  if (thumbnailPath.startsWith('http')) return thumbnailPath;
  return `${API_URL}${thumbnailPath}`;
};

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
      console.error('Network error:', error);
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }

    // Handle specific HTTP errors
    switch (error.response.status) {
      case 401:
        console.error('Authentication error:', error.response.data);
        // Clear storage on unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
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
      
      // Log the full response for debugging
      console.log('Full login response:', response.data);
      
      // Check if response has data
      if (!response.data) {
        throw new Error('No response data received');
      }

      // Check if token exists
      if (!response.data.token) {
        throw new Error('No authentication token received');
      }

      // Check if user data exists - it's in response.data.data
      if (!response.data.data) {
        throw new Error('No user data received');
      }

      // Store token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Return restructured response with user data in the expected format
      return {
        data: {
          user: response.data.data,
          token: response.data.token
        }
      };
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);
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
  getAllCourses: () => api.get('/api/courses'),
  getCourseById: (id) => api.get(`/api/courses/${id}`),
  createCourse: async (courseData) => {
    const response = await api.post('/api/courses', courseData);
    return response;
  },
  updateCourseThumbnail: (courseId, formData) => {
    return api.post(`/api/courses/${courseId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteThumbnail: (courseId) => api.delete(`/api/courses/${courseId}/thumbnail`),
  enrollCourse: async (courseId) => {
    try {
      const response = await api.post(`/api/enrollments`, { courseId });
      return response;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },
  getEnrolledCourses: () => api.get('/api/enrollments'),
  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get('/api/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

export default api;
