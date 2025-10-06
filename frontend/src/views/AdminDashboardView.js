import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import MostActiveShoCard from '../components/MostActiveShoCard';
// eslint-disable-next-line no-unused-vars
import { createSho, updateSho, deleteSho, getAllShos, adminCreateStudentForSho, adminCreateStudentsBatchForSho } from '../services/api';
import AdminController from '../controllers/AdminController';

const AdminDashboardView = () => {
  const { user, isAuthenticated, forceRefreshUser } = useAuth();
  const navigate = useNavigate();
  
  // Tab management
  const [activeTab, setActiveTab] = useState('dashboard');
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Refresh user data when profile tab is accessed
  useEffect(() => {
    if (activeTab === 'profile') {
      forceRefreshUser();
    }
  }, [activeTab, forceRefreshUser]);
  
  // General state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loading, setLoading] = useState(false);
  
  // SHO Management state
  const [shos, setShos] = useState([]);
  const [shoLoading, setShoLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSho, setEditingSho] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shoToDelete, setShoToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ assignedSho: '', fullName: '', email: '', mobileNumber: '', domain: '', batch: '', registerNumber: '', gender: 'Male', dateOfBirth: '' });
  const [batchText, setBatchText] = useState('');
  
  // Student list modal state
  const [showStudentListModal, setShowStudentListModal] = useState(false);
  const [selectedSho, setSelectedSho] = useState(null);
  const [studentsOfSho, setStudentsOfSho] = useState([]);
  const [studentListLoading, setStudentListLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    username: '' // Keeping username since it's used in handleEdit
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/loginadmin');
    }
  }, [isAuthenticated, navigate]);

  // Fetch data when tabs are active
  useEffect(() => {
    if (activeTab === 'shos') {
      fetchShos();
    }
  }, [activeTab]);

  // Fetch SHOs function
  const fetchShos = async () => {
    try {
      setShoLoading(true);
      const response = await getAllShos();
      console.log('SHOs API Response:', response);
      // Backend returns array directly, not wrapped in an object
      const shosData = Array.isArray(response) ? response : [];
      console.log('Processed SHOs data:', shosData);
      setShos(shosData);
    } catch (error) {
      console.error('Error fetching SHOs:', error);
      setError('Failed to fetch SHOs');
    } finally {
      setShoLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // SHO Management handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      mobileNumber: '',
      password: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingSho(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const shoData = {
        ...formData,
        photo: selectedFile
      };

      if (editingSho) {
        await updateSho(editingSho.id, shoData);
        setSuccess('SHO updated successfully!');
      } else {
        await createSho(shoData);
        setSuccess('SHO created successfully!');
      }

      closeModal();
      fetchShos();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save SHO');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sho) => {
    setEditingSho(sho);
    setFormData({
      username: sho.username || '',
      fullName: sho.fullName || '',
      email: sho.email || '',
      mobileNumber: sho.mobileNumber || ''
    });
    setPreviewUrl(sho.photoUrl || null);
    setShowModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setShoToDelete(null);
    setDeleteConfirmationText('');
    setError('');
  };

  const handleDelete = (shoId) => {
    const sho = shos.find(s => s.id === shoId);
    setShoToDelete(sho);
    setDeleteConfirmationText('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmationText.toLowerCase() !== shoToDelete?.username.toLowerCase()) {
      setError('Please type the username correctly to confirm deletion');
      return;
    }

    try {
      setLoading(true);
      await deleteSho(shoToDelete.id);
      setSuccess('SHO deleted successfully!');
      setShowDeleteModal(false);
      setShoToDelete(null);
      setDeleteConfirmationText('');
      fetchShos();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete SHO');
    } finally {
      setLoading(false);
    }
  };



  const handleViewStudents = async (sho) => {
    setSelectedSho(sho);
    setShowStudentListModal(true);
    setStudentListLoading(true);
    try {
      const result = await AdminController.getStudentsForSho(sho.id);
      if (result.success) {
        setStudentsOfSho(result.data);
      } else {
        setError(result.error || 'Failed to fetch students');
        setStudentsOfSho([]);
      }
    } catch (error) {
      setError('Failed to fetch students');
      setStudentsOfSho([]);
    } finally {
      setStudentListLoading(false);
    }
  };

  const closeStudentListModal = () => {
    setShowStudentListModal(false);
    setSelectedSho(null);
    setStudentsOfSho([]);
    setStudentListLoading(false);
  };

  // Filter and paginate SHOs
  const filteredShos = shos.filter(sho =>
    sho.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sho.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sho.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredShos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShos = filteredShos.slice(startIndex, startIndex + itemsPerPage);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 flex flex-col">
        <Header activeTab={activeTab} onTabChange={handleTabChange} />
        
        <main className="flex-1 p-8 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto">
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-3 shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center space-x-3 shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Welcome to Admin Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="mb-8">
                  <StatsCards />
                </div>
                
                {/* Most Active SHO Card */}
                <div className="mb-8">
                  <MostActiveShoCard />
                </div>
              </div>
            )}

            {/* SHO Management Tab */}
            {activeTab === 'shos' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">SHO Management</h1>
                    <p className="text-gray-600">Manage and monitor Security Head Officers</p>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="bg-white backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <button
                        onClick={openModal}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-indigo-600/20 group"
                      >
                        <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add New SHO</span>
                      </button>
                    {/* Admin Add New Student button removed as requested */}
                    </div>
                    
                    <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search SHOs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* SHO Grid */}
                  {shoLoading ? (
                    <div className="flex items-center justify-center p-8">
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <span>Loading SHO data...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                    {paginatedShos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedShos.map((sho) => (
                          <Link
                            key={sho.id}
                            to={`/admin/sho/${sho.id}`}
                            className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                          >
                            {/* Photo and Status */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-300">
                                    {sho.photoUrl ? (
                                      <img
                                        src={sho.photoUrl}
                                        alt={sho.fullName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                                        {sho.fullName?.charAt(0) || 'S'}
                                      </div>
                                    )}
                                  </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    sho.isActive !== false 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200'
                                  }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                  sho.isActive !== false ? 'bg-green-600' : 'bg-red-600'
                                    }`}></span>
                                    {sho.isActive !== false ? 'Active' : 'Inactive'}
                                  </span>
                            </div>

                            {/* Name and Username */}
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {sho.fullName}
                              </h3>
                              <p className="text-sm text-blue-600">@{sho.username}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{sho.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{sho.mobileNumber}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                    <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleViewStudents(sho);
                                  }}
                                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                  title="View Students"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                      </svg>
                                    </button>
                                    <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEdit(sho);
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(sho.id);
                                  }}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                              <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                                View Details →
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {searchTerm ? 'No SHOs Found' : 'No SHOs Available'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {searchTerm ? 'No SHOs match your search criteria.' : 'Get started by creating your first SHO.'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={openModal}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            Create First SHO
                          </button>
                        )}
                        </div>
                      )}
                    </>
                  )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredShos.length)} of {filteredShos.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 hover:border-blue-300"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 hover:border-blue-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Admin Add Student modal removed as requested */}
      
      {/* Create/Edit SHO Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingSho ? 'Edit SHO Profile' : 'Add New SHO'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center space-x-4">
                    {previewUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-300"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex justify-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <span className="text-sm text-gray-600">Choose Photo</span>
                        <input
                          type="file"
                          id="photo"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{editingSho ? 'Update SHO' : 'Create SHO'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 border border-red-200 shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
            </div>

              <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete the SHO <span className="font-bold text-gray-800">{shoToDelete?.fullName}</span>?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-gray-600 text-sm">
                  Please type <span className="font-mono font-bold text-red-600">{shoToDelete?.username}</span> to confirm deletion.
                </p>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="mt-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type username to confirm"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
                {deleteConfirmationText && deleteConfirmationText.toLowerCase() !== shoToDelete?.username.toLowerCase() && (
                  <p className="mt-2 text-sm text-yellow-600">
                    Username must match exactly to confirm deletion
                  </p>
                )}
              </div>
            </div>            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmationText !== shoToDelete?.username}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete this SHO</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Profile</h1>
                <p className="text-gray-600">View and manage your admin account information</p>
              </div>
              <button
                onClick={forceRefreshUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold text-xl">{user?.username?.charAt(0).toUpperCase() || 'A'}</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800">{user?.fullName || user?.username}</h4>
                <p className="text-gray-600">{user?.email || 'No email linked'}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                    {user?.username || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                    {user?.fullName || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 flex items-center justify-between">
                    <span>{user?.email || 'No email linked'}</span>
                    {user?.email && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                    Administrator
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 flex items-center justify-between">
                    <span>Active</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Online
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="text-lg font-semibold text-gray-800 mb-4">Email Management</h5>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Linked Email</p>
                    <p className="text-sm text-blue-600">{user?.email || 'No email linked yet'}</p>
                  </div>
                  <button
                    onClick={forceRefreshUser}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                {!user?.email && (
                  <p className="text-xs text-blue-600 mt-2">
                    Use the Email Settings option in the header dropdown to link an email address for password reset functionality.
                  </p>
                )}
                {user?.email && (
                  <p className="text-xs text-green-600 mt-2">
                    ✅ Email is properly linked and verified for password reset functionality.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student List Modal */}
      {showStudentListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Students of {selectedSho?.fullName}
              </h3>
              <button
                onClick={closeStudentListModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {studentListLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span>Loading students...</span>
                        </div>
                    </div>
            ) : studentsOfSho.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Register Number
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {studentsOfSho.map((student) => (
                        <tr key={student.id} className="hover:bg-blue-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {student.registerNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            @{student.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              student.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                student.isActive ? 'bg-green-600' : 'bg-red-600'
                              }`}></span>
                              {student.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">No Students Assigned</h4>
                <p className="text-gray-600">No students are currently assigned to this SHO.</p>
                  </div>
            )}

            <div className="flex justify-end mt-6">
                  <button
                onClick={closeStudentListModal}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
                  </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;