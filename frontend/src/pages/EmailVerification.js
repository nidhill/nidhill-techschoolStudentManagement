import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EmailVerification = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { token } = useParams();

  // Verify email token on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setSuccess(true);
          setError('');
        } else {
          setError(data.message || 'Email verification failed');
          setSuccess(false);
        }
      } catch (error) {
        setError('Failed to verify email. Please try again.');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError('No verification token provided');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Verifying Email...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we verify your email address
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 rounded-lg flex items-center justify-center ${
            success ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {success ? (
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {success ? 'Email Verified Successfully!' : 'Email Verification Failed'}
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-600">
            {success 
              ? 'Your email address has been verified and updated successfully.'
              : error || 'There was a problem verifying your email address.'
            }
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            {success ? 'Continue to Login' : 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

