import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state from localStorage (persist session across refresh)
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        return { 
          success: false, 
          message: 'Invalid response from server' 
        };
      }
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state immediately
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (updates) => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const updatedUser = { ...parsedUser, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      } catch (error) {
        console.error('Error updating profile:', error);
        return false;
      }
    }
    return false;
  };

  const refreshAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        logout();
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Get fresh user data from server
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      
      if (userData) {
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  };

  const forceRefreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Clear current user data
      setUser(null);
      
      // Get fresh user data from server
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      
      if (userData) {
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('User data refreshed:', userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    refreshAuth,
    updateProfile,
    refreshUserData,
    forceRefreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

