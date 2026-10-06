import api from '../api/axios';

export const receiptService = {
  /**
   * Get available transaction categories for receipts
   */
  async getCategories() {
    const response = await api.get('/transactions/categories/expense');
    return response.data;
  },

  /**
   * Upload and scan receipt image via OCR
   */
  async uploadReceipt(formData, onUploadProgress) {
    const response = await api.post('/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Save confirmed receipt transaction
   */
  async saveReceiptTransaction(data) {
    const response = await api.post('/receipts/save-transaction', data);
    return response.data;
  },
};

export default receiptService;
