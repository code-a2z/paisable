import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');
      await api.delete('/users/account');
      logout(); 
    } catch (err) {
      console.error(err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Account Info</h2>
        <p className="mt-2 text-gray-800 dark:text-gray-200"><strong>Email:</strong> {user?.email}</p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Feedback & Suggestions</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Have an idea to improve Paisable, found an issue, or want to share your thoughts? We would love to hear from you.
        </p>
        <Link
          to="/feedback"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        >
          Share Feedback
        </Link>
      </div>

      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Deleting your account is permanent. All your data will be lost.
        </p>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
