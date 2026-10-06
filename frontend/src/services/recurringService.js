import api from '../api/axios';

export const recurringService = {
  /**
   * Get all recurring transactions
   */
  async getRecurringTransactions() {
    const response = await api.get('/recurring');
    return response.data;
  },

  /**
   * Get categories for recurring transactions
   */
  async getCategories() {
    const response = await api.get('/transactions/categories/expense');
    return response.data;
  },

  /**
   * Create recurring transaction
   */
  async createRecurringTransaction(formData) {
    const response = await api.post('/recurring/create', formData);
    return response.data;
  },

  /**
   * Update recurring transaction
   */
  async updateRecurringTransaction(id, formData) {
    const response = await api.put(`/recurring/${id}`, formData);
    return response.data;
  },

  /**
   * Delete recurring transaction
   */
  async deleteRecurringTransaction(id) {
    const response = await api.delete(`/recurring/${id}`);
    return response.data;
  },
};

export default recurringService;
