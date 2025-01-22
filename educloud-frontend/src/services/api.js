import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
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
      
      // Log the full response for debugging
      console.log('Full login response:', response);
      
      // Check if response has data
      if (!response.data) {
        throw new Error('No response data received');
      }

      // Check if token exists
      if (!response.data.token) {
        throw new Error('No authentication token received');
      }

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Invalid email or password');
          case 404:
            throw new Error('User not found');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(error.response.data?.message || 'Login failed');
        }
      }
      
      throw new Error('Network error. Please check your connection');
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
  getAllCourses() {
    return api.get('/api/courses').then(response => {
      console.log('Raw courses API response:', response);
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      return response;
    }).catch(error => {
      console.error('Courses API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw error;
    });
  },
  getCourseById(id) {
    return api.get(`/api/courses/${id}`);
  },
  createCourse(courseData) {
    console.log('API createCourse called with:', courseData);
    
    // If courseData is already FormData, use it directly
    if (courseData instanceof FormData) {
      console.log('FormData entries:');
      for (let [key, value] of courseData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      return api.post('/api/courses', courseData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).catch(error => {
        console.error('API Error Response:', error.response?.data);
        console.error('API Error Status:', error.response?.status);
        console.error('API Error Headers:', error.response?.headers);
        throw error;
      });
    }

    // Otherwise, create new FormData
    const formData = new FormData();
    
    Object.keys(courseData).forEach(key => {
      if (key === 'thumbnail') {
        if (courseData[key]) {
          formData.append('thumbnail', courseData[key]);
        }
      } else if (Array.isArray(courseData[key])) {
        formData.append(key, JSON.stringify(courseData[key]));
      } else if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });
    
    console.log('Created FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    return api.post('/api/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(error => {
      console.error('API Error Response:', error.response?.data);
      console.error('API Error Status:', error.response?.status);
      console.error('API Error Headers:', error.response?.headers);
      throw error;
    });
  },
  updateCourseThumbnail(courseId, formData) {
    return api.put(`/api/courses/${courseId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteThumbnail(courseId) {
    return api.delete(`/api/courses/${courseId}/thumbnail`);
  },
  enrollCourse: async (courseId) => {
    try {
      const response = await api.post(`/api/courses/${courseId}/enroll`);
      console.log('Enrollment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Enrollment error details:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  getEnrolledCourses() {
    return api.get('/api/users/courses');
  },
  getDashboardStats() {
    return api.get('/api/dashboard/stats');
  },
};

export default api;
