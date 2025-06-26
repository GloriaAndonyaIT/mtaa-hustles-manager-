import React, { useState } from 'react';
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Trash2, AlertTriangle, X, Check } from 'lucide-react';
import config from "../config.json";

const SettingsPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${config.api_url}/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Account deleted successfully');
        localStorage.removeItem('access_token');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while deleting your account');
      console.error('Delete account error:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Settings Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 px-6 py-4 flex items-center">
            <Settings className="h-6 w-6 text-white mr-2" />
            <h1 className="text-xl font-semibold text-white">Account Settings</h1>
          </div>

          {/* User Info Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 text-teal-800 rounded-full h-12 w-12 flex items-center justify-center">
                <span className="text-xl font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">{user?.username}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Danger Zone Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
            
            {/* Logout Button */}
            <div className="mb-4">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-3 text-gray-600" />
                  <span>Logout</span>
                </div>
                <span className="text-gray-500 text-sm">Sign out of your account</span>
              </button>
            </div>

            {/* Delete Account Button */}
            <div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center">
                  <Trash2 className="h-5 w-5 mr-3" />
                  <span>Delete Account</span>
                </div>
                <span className="text-red-400 text-sm">Permanently delete your account</span>
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="px-6 pb-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="px-6 pb-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 pt-1">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
                <p className="text-gray-600 mt-1">
                  This action cannot be undone. All your data will be permanently deleted.
                  Are you sure you want to proceed?
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-md text-white ${isDeleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} transition-colors flex items-center`}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;