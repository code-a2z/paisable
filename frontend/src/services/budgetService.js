import api from '../api/axios';

export const budgetService = {
  /**
   * Get all budgets for the current user
   */
  async getBudgets() {
    const response = await api.get('/budgets');
    return response.data;
  },

  /**
   * Add a new budget
   */
  async addBudget(formData) {
    const response = await api.post('/budgets', formData);
    return response.data;
  },

  /**
   * Update an existing budget
   */
  async updateBudget(id, formData) {
    const response = await api.put(`/budgets/${id}`, formData);
    return response.data;
  },

  /**
   * Delete a budget by ID
   */
  async deleteBudget(id) {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

export default budgetService;
