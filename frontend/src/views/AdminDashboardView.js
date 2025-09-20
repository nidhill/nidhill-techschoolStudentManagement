import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import LoginDetails from '../components/LoginDetails';
import AdminController from '../controllers/AdminController';
import AuthController from '../controllers/AuthController';
import User from '../models/User';
import Stats from '../models/Stats';

const AdminDashboardView = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [shos, setShos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSho, setEditingSho] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [stats, setStats] = useState(new Stats());
  const [formData, setFormData] = useState(new User());
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shoToDelete, setShoToDelete] = useState(null);
  const [selectedShos, setSelectedShos] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [shoToToggleStatus, setShoToToggleStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginDetails, setShowLoginDetails] = useState(false);
  const [selectedShoForLogin, setSelectedShoForLogin] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated || !user || user.role !== 'admin') {
      // For testing purposes, allow access but show a warning
      setError('Not logged in as admin. Some features may not work properly. Click "Quick Test Login" to login.');
      // Still try to fetch data for testing
      fetchShos();
      return;
    }
    fetchShos();
  }, [isAuthenticated, user, navigate]);

  const fetchShos = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const result = await AdminController.getAllShos();
      if (result.success) {
        const shoModels = result.data.map(sho => User.fromApiResponse(sho));
        setShos(shoModels);
        setStats(Stats.calculateFromShos(result.data));
      } else {
        setError(result.error || 'Failed to fetch SHOs');
      }
    } catch (error) {
      console.error('Fetch SHOs error:', error);
      setError('Failed to fetch SHOs. Please check your connection and authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = new User(prev);
      newFormData[name] = value;
      return newFormData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation for required fields
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }
    
    setSubmitting(true);
    try {
      const shoData = {
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        photo: selectedFile
      };

      let result;
      if (editingSho) {
        result = await AdminController.updateSho(editingSho.id, shoData);
        if (result.success) {
          setSuccess('SHO updated successfully');
        }
      } else {
        result = await AdminController.createSho(shoData);
        if (result.success) {
          setSuccess('SHO created successfully');
        }
      }

      if (result.success) {
        setSuccess('SHO created successfully!');
        setFormData(new User());
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowModal(false);
        setEditingSho(null);
        await fetchShos();
      } else {
        console.error('SHO creation failed:', result.error);
        setError(result.error || 'Failed to create SHO. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sho) => {
    setEditingSho(sho);
    setFormData(new User(sho));
    setSelectedFile(null);
    setPreviewUrl(sho.getPhotoUrl());
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const sho = shos.find(s => s.id === id);
    setShoToDelete(sho);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await AdminController.deleteSho(shoToDelete.id);
      if (result.success) {
        setSuccess(`${shoToDelete.getDisplayName()} deleted successfully`);
        await fetchShos();
        setShowDeleteModal(false);
        setShoToDelete(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setShoToDelete(null);
  };

  const handleSelectSho = (shoId) => {
    setSelectedShos(prev =>
      prev.includes(shoId)
        ? prev.filter(id => id !== shoId)
        : [...prev, shoId]);
  };

  const handleSelectAll = () => {
    if (selectedShos.length === currentShos.length) setSelectedShos([]);
    else setSelectedShos(currentShos.map(sho => sho.id));
  };

  const handleBulkDelete = () => {
    if (selectedShos.length === 0) return;
    setShowBulkActions(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const result = await AdminController.bulkDeleteShos(selectedShos);
      if (result.success) {
        setSuccess(result.data.message);
        setSelectedShos([]);
        setShowBulkActions(false);
        await fetchShos();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message || 'Error deleting SHOs');
    }
  };

  const exportShos = () => {
    const result = AdminController.exportShos(shos);
    if (result.success) {
      setSuccess(result.data.message);
    } else {
      setError(result.error);
    }
  };

  const toggleShoStatus = (sho) => {
    setShoToToggleStatus(sho);
    setShowStatusModal(true);
  };

  const confirmStatusToggle = async () => {
    try {
      const result = await AdminController.toggleShoStatus(shoToToggleStatus.id, !shoToToggleStatus.isActive);
      if (result.success) {
        setSuccess(`${shoToToggleStatus.getDisplayName()} status updated`);
        await fetchShos();
        setShowStatusModal(false);
        setShoToToggleStatus(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message || 'Error updating SHO status');
    }
  };

  const viewLoginDetails = (sho) => {
    setSelectedShoForLogin(sho);
    setShowLoginDetails(true);
  };

  const closeLoginDetails = () => {
    setShowLoginDetails(false);
    setSelectedShoForLogin(null);
  };

  const openCreateModal = () => {
    setEditingSho(null);
    setFormData(new User());
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSho(null);
    setFormData(new User());
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setSuccess('');
  };

  // Filter and paginate
  const filteredShos = shos.filter(sho =>
    sho.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sho.fullName && sho.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sho.email && sho.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShos = filteredShos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredShos.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Test login function for quick testing
  const testLogin = async () => {
    try {
      const result = await AuthController.login('admin', 'admin123');
      if (result.success) {
        // Store token and user data
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        // Refresh the page to update authentication state
        window.location.reload();
      } else {
        setError('Test login failed: ' + result.error);
      }
    } catch (error) {
      setError('Test login error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Main Content */}
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">SHO Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportShos}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add New SHO
                  </button>
                </div>
              </div>

              {/* Search and Bulk Actions */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search SHOs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedShos.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Selected ({selectedShos.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}
              {error && (
                <div className={`mb-4 p-3 rounded ${
                  error.includes('Not logged in') 
                    ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  <div className="flex justify-between items-center">
                    <span>{error}</span>
                    <div className="flex gap-2">
                      {error.includes('Not logged in') && (
                        <>
                          <button
                            onClick={() => navigate('/admin/login')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Login Page
                          </button>
                          <button
                            onClick={testLogin}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Quick Test Login
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedShos.length === currentShos.length && currentShos.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Photo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentShos.map((sho) => (
                        <tr key={sho.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedShos.includes(sho.id)}
                              onChange={() => handleSelectSho(sho.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sho.getPhotoUrl() ? (
                              <img
                                src={sho.getPhotoUrl()}
                                alt={sho.getDisplayName()}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-sm">
                                  {sho.getDisplayName().charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sho.getDisplayName()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sho.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sho.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sho.mobileNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                sho.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {sho.getStatusText()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col">
                              <span className="text-xs">{sho.getLastLoginText()}</span>
                              <span className={`text-xs ${sho.getLoginStatus().color}`}>
                                {sho.getLoginStatus().text}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => viewLoginDetails(sho)}
                                className="text-purple-600 hover:text-purple-900 text-xs"
                                title="View Login Details"
                              >
                                📊 Login
                              </button>
                              <button
                                onClick={() => handleEdit(sho)}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleShoStatus(sho)}
                                className={`text-xs ${
                                  sho.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                }`}
                              >
                                {sho.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDelete(sho.id)}
                                className="text-red-600 hover:text-red-900 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingSho ? 'Edit SHO' : 'Add New SHO'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingSho ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {shoToDelete?.getDisplayName()}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedShos.length} selected SHOs? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkActions(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Toggle Status</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {shoToToggleStatus?.isActive ? 'deactivate' : 'activate'} {shoToToggleStatus?.getDisplayName()}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusToggle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {shoToToggleStatus?.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Details Modal */}
      {showLoginDetails && (
        <LoginDetails
          sho={selectedShoForLogin}
          onClose={closeLoginDetails}
        />
      )}
    </div>
  );
};

export default AdminDashboardView;
