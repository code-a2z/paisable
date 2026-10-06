import api from '../api/axios';

/**
 * Exports all transactions to a CSV file
 * Downloads the file automatically to the user's device
 */
export const handleExportCSV = async () => {
  try {
    const res = await api.get('/transactions/export', {
      responseType: 'blob', // Important for file download
    });
    const blobData = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paisable_transactions.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export CSV", error);
    alert("Failed to export CSV. Please try again.");
  }
};