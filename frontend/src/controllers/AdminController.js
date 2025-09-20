import api from '../services/api';

class AdminController {
  static async getAllShos() {
    try {
      const response = await api.get('/admin/shos');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch SHOs'
      };
    }
  }

  static async createSho(shoData) {
    try {
      console.log('Creating SHO with data:', shoData);
      
      const formData = new FormData();
      formData.append('fullName', shoData.fullName);
      formData.append('email', shoData.email);
      formData.append('mobileNumber', shoData.mobileNumber);
      
      if (shoData.photo) {
        formData.append('photo', shoData.photo);
      }

      console.log('Sending request to /admin/shos');
      const response = await api.post('/admin/shos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Response received:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating SHO:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create SHO';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  static async updateSho(id, shoData) {
    try {
      const formData = new FormData();
      
      // Only append username and password if they exist
      if (shoData.username) {
        formData.append('username', shoData.username);
      }
      if (shoData.password) {
        formData.append('password', shoData.password);
      }
      
      formData.append('fullName', shoData.fullName);
      formData.append('email', shoData.email);
      formData.append('mobileNumber', shoData.mobileNumber);
      
      if (shoData.photo) {
        formData.append('photo', shoData.photo);
      }

      const response = await api.put(`/admin/shos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update SHO'
      };
    }
  }

  static async deleteSho(id) {
    try {
      const response = await api.delete(`/admin/shos/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete SHO'
      };
    }
  }

  static async bulkDeleteShos(ids) {
    try {
      const promises = ids.map(id => api.delete(`/admin/shos/${id}`));
      await Promise.all(promises);
      return {
        success: true,
        data: { message: `${ids.length} SHOs deleted successfully` }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete SHOs'
      };
    }
  }

  static async toggleShoStatus(id, isActive) {
    try {
      const response = await api.put(`/admin/shos/${id}`, { isActive });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update SHO status'
      };
    }
  }

  static async exportShos(shos) {
    try {
      const csvContent = [
        ['Full Name', 'Username', 'Email', 'Mobile Number', 'Status', 'Created Date'],
        ...shos.map(sho => [
          sho.fullName || 'N/A', 
          sho.username,
          sho.email || 'N/A', 
          sho.mobileNumber || 'N/A',
          sho.isActive !== false ? 'Active' : 'Inactive',
          new Date(sho.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shos-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        data: { message: 'SHOs exported successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to export SHOs'
      };
    }
  }
}

export default AdminController;
