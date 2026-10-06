import api from '../api/axios';

export const transactionService = {
  /**
   * Get filtered & paginated transactions
   */
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/transactions?${query}` : '/transactions';
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get transaction summary statistics
   */
  async getSummary() {
    const response = await api.get('/transactions/summary');
    return response.data;
  },

  /**
   * Get chart aggregate data
   */
  async getCharts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/transactions/charts?${query}` : '/transactions/charts';
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get expense categories
   */
  async getExpenseCategories() {
    const response = await api.get('/transactions/categories/expense');
    return response.data;
  },

  /**
   * Get income categories
   */
  async getIncomeCategories() {
    const response = await api.get('/transactions/categories/income');
    return response.data;
  },

  /**
   * Add a new transaction
   */
  async addTransaction(formData) {
    const response = await api.post('/transactions', formData);
    return response.data;
  },

  /**
   * Update an existing transaction
   */
  async updateTransaction(id, formData) {
    const response = await api.put(`/transactions/${id}`, formData);
    return response.data;
  },

  /**
   * Delete a transaction by ID
   */
  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Bulk delete transactions by IDs
   */
  async bulkDeleteTransactions(transactionIds) {
    const response = await api.delete('/transactions/bulk', {
      data: { transactionIds },
    });
    return response.data;
  },

  /**
   * Delete a user category
   */
  async deleteCategory(categoryToDelete) {
    const response = await api.delete('/transactions/category', {
      data: { categoryToDelete },
    });
    return response.data;
  },

  /**
   * Export transactions as CSV blob
   */
  async exportTransactionsCSV() {
    const response = await api.get('/transactions/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default transactionService;
