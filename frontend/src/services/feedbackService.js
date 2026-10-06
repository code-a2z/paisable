import api from '../api/axios';

export const feedbackService = {
  /**
   * Submit feedback
   */
  async submitFeedback(data) {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  /**
   * Get all feedback
   */
  async getFeedback() {
    const response = await api.get('/feedback');
    return response.data;
  },
};

export default feedbackService;
