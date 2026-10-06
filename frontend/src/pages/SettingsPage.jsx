import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useCurrency from '../hooks/useCurrency';
import useTheme from '../hooks/useTheme';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { 
  User, 
  Settings as SettingsIcon, 
  Lock, 
  Trash2, 
  Save, 
  Bell, 
  Globe, 
  Calendar, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

const AVATAR_PRESETS = [
  '🧑‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🧑‍🎨', '👩‍🔬', '🧙‍♂️', '🚀', '🌟', '💎'
];

const DATE_FORMATS = [
  { label: 'YYYY-MM-DD (e.g. 2026-10-06)', value: 'YYYY-MM-DD' },
  { label: 'DD/MM/YYYY (e.g. 06/10/2026)', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY (e.g. 10/06/2026)', value: 'MM/DD/YYYY' },
];

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const { currency, changeCurrency, supportedCurrencies } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'personalization' | 'security' | 'danger'
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    phone: '',
    occupation: '',
    avatar: '👨‍💻',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Personalization State
  const [personalizationForm, setPersonalizationForm] = useState({
    defaultCurrency: 'USD',
    dateFormat: 'YYYY-MM-DD',
    theme: 'light',
    budgetAlerts: true,
    emailNotifications: true,
  });
  const [isSavingPersonalization, setIsSavingPersonalization] = useState(false);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account State
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        occupation: user.occupation || '',
        avatar: user.avatar || '👨‍💻',
      });

      setPersonalizationForm({
        defaultCurrency: user.defaultCurrency || currency.code || 'USD',
        dateFormat: user.preferences?.dateFormat || 'YYYY-MM-DD',
        theme: user.preferences?.theme || theme || 'light',
        budgetAlerts: user.preferences?.budgetAlerts !== false,
        emailNotifications: user.preferences?.emailNotifications !== false,
      });
    }
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await api.put('/users/profile', profileForm);
      if (updateUser) {
        updateUser(res.data);
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Personalization Update
  const handleSavePersonalization = async (e) => {
    e.preventDefault();
    try {
      setIsSavingPersonalization(true);
      const payload = {
        defaultCurrency: personalizationForm.defaultCurrency,
        preferences: {
          dateFormat: personalizationForm.dateFormat,
          theme: personalizationForm.theme,
          budgetAlerts: personalizationForm.budgetAlerts,
          emailNotifications: personalizationForm.emailNotifications,
        },
      };

      const res = await api.put('/users/profile', payload);
      if (updateUser) {
        updateUser(res.data);
      }

      // Update global currency context if changed
      if (personalizationForm.defaultCurrency !== currency.code) {
        changeCurrency(personalizationForm.defaultCurrency);
      }

      // Update theme if changed
      if (personalizationForm.theme !== theme) {
        toggleTheme();
      }

      toast.success('Personalization preferences saved!');
    } catch (err) {
      console.error('Failed to save personalization', err);
      toast.error(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setIsSavingPersonalization(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Failed to change password', err);
      toast.error(err.response?.data?.message || 'Failed to update password. Check current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'WARNING: Are you absolutely sure you want to delete your account? All your transaction data, receipts, and budgets will be permanently deleted. This action CANNOT be undone.'
    );

    if (!confirmed) return;

    try {
      setIsDeletingAccount(true);
      await api.delete('/users/account');
      toast.info('Account deleted successfully.');
      logout();
    } catch (err) {
      console.error('Failed to delete account', err);
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const navTabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'personalization', label: 'Personalization', icon: SettingsIcon },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings & Personalization</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Manage your personal details, financial preferences, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 space-y-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8 lg:col-span-9">
          {/* PROFILE SECTION */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profile Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your personal information visible on your account.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Profile Avatar
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-3xl flex items-center justify-center border-2 border-blue-500 shadow-inner">
                      {profileForm.avatar}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_PRESETS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, avatar: av })}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                            profileForm.avatar === av
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 scale-110 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Email (Read only) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email Address (Permanent)
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Occupation / Role
                    </label>
                    <input
                      type="text"
                      value={profileForm.occupation}
                      onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                      placeholder="e.g. Software Engineer, Designer"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Short Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Write a brief intro about yourself..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PERSONALIZATION SECTION */}
          {activeTab === 'personalization' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personalization & Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Tailor your Paisable interface, notifications, and localized formatting.
                </p>
              </div>

              <form onSubmit={handleSavePersonalization} className="space-y-6">
                {/* Default Currency */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Default Currency
                  </label>
                  <select
                    value={personalizationForm.defaultCurrency}
                    onChange={(e) => setPersonalizationForm({ ...personalizationForm, defaultCurrency: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {supportedCurrencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} — {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Date Display Format
                  </label>
                  <select
                    value={personalizationForm.dateFormat}
                    onChange={(e) => setPersonalizationForm({ ...personalizationForm, dateFormat: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {DATE_FORMATS.map((fmt) => (
                      <option key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme Mode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Default Interface Theme
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPersonalizationForm({ ...personalizationForm, theme: 'light' })}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        personalizationForm.theme === 'light'
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">☀️ Light Mode</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bright, crisp background</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersonalizationForm({ ...personalizationForm, theme: 'dark' })}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        personalizationForm.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">🌙 Dark Mode</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Easy on eyes at night</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Notifications & Alert Toggles */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    Alerts & Notifications
                  </h3>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Budget Limit Warning</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified when approaching 80% of any active monthly budget.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={personalizationForm.budgetAlerts}
                        onChange={(e) => setPersonalizationForm({ ...personalizationForm, budgetAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Weekly Digest Email</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Receive a weekly spending breakdown and analytics summary.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={personalizationForm.emailNotifications}
                        onChange={(e) => setPersonalizationForm({ ...personalizationForm, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPersonalization}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingPersonalization ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECURITY & PASSWORD SECTION */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Security & Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your account password regularly to keep your financial data protected.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    New Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DANGER ZONE SECTION */}
          {activeTab === 'danger' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Irreversible actions regarding your account and financial data.
                </p>
              </div>

              <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 space-y-3">
                <h3 className="text-base font-semibold text-red-700 dark:text-red-300">
                  Delete Account & Erase All Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Once you delete your account, there is no going back. All your recorded transactions, budgets, receipt uploads, and personalized preferences will be permanently wiped.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
