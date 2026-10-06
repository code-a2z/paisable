import api from '../api/axios';

export const authService = {
  /**
   * Log in user with email & password
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new user
   */
  async signup(email, password) {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Complete onboarding setup
   */
  async completeSetup({ defaultCurrency }) {
    const response = await api.put('/auth/setup', { defaultCurrency });
    return response.data;
  },
};

export default authService;
