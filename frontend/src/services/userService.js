import api from '../api/axios';

export const userService = {
  /**
   * Get user profile
   */
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update user profile and personalization preferences
   */
  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  /**
   * Change user password
   */
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Permanently delete user account and associated data
   */
  async deleteAccount() {
    const response = await api.delete('/users/account');
    return response.data;
  },
};

export default userService;
