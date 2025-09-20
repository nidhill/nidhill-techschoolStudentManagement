import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login request
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.log('API Interceptor: 401 error, clearing storage and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/loginadmin';
    }
    return Promise.reject(error);
  }
);

export default api;

