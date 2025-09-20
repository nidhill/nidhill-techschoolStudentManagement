import api from '../services/api';

class AuthController {
  static async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }

  static async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get user data'
      };
    }
  }

  static async logout() {
    // Clear token from localStorage
    localStorage.removeItem('token');
    return { success: true };
  }
}

export default AuthController;

