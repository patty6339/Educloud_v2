import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          console.log('No auth data found in localStorage');
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          
          // Set auth headers for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Validate token with backend
          const response = await api.get('/api/users/validate');
          if (response.data?.valid) {
            console.log('Token validated successfully');
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            console.log('Token validation failed');
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('Auth validation error:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  const login = async (userData, token) => {
    try {
      // First set the token in localStorage and axios headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Then set the user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Finally update the state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful:', { 
        user: userData,
        token: token ? `${token.substring(0, 10)}...` : 'No token',
        isAuthenticated: true
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Clean up on error
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
