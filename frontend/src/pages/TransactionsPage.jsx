import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { transactionService } from '../services';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailModal from '../components/TransactionDetailModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import Spinner from '../components/Spinner';
import useCurrency from '../hooks/useCurrency';
import EmptyState from '../components/EmptyState';
import { handleExportCSV } from '../utils/transactions';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  const [viewingDetails, setViewingDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debounceTimer = useRef(null); // Changed to useRef


  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { currency } = useCurrency();
  const isInitialMount = useRef(true);
  const allCategories = [...new Set([...expenseCategories, ...incomeCategories])]; 

  const fetchData = useCallback(async (currentSearchTerm = searchTerm) => {
    if (isInitialMount.current) {
      setLoading(true);
    } else {
      setIsFiltering(true);
    }

    try {
      const [summaryRes, expenseCategoriesRes, incomeCategoriesRes] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getExpenseCategories(),
        transactionService.getIncomeCategories()
      ]);
      setSummaryData(summaryRes);
      setExpenseCategories(expenseCategoriesRes || []);
      setIncomeCategories(incomeCategoriesRes || []);
      const params = {
        page: page.toString(),
        limit: '10'
      };

      if (currentSearchTerm) {
        params.search = currentSearchTerm;
      }
      if (typeFilter !== 'all') {
        params.isIncome = typeFilter === 'income' ? 'true' : 'false';
      }
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (dateFrom) {
        params.startDate = dateFrom;
      }
      if (dateTo) {
        params.endDate = dateTo;
      }

      const transactionsRes = await transactionService.getTransactions(params);
      setTransactions(transactionsRes?.transactions || []);
      setTotalPages(transactionsRes?.totalPages || 1);
      setSelectedTransactionIds([]); // Clear selection on data change

    } catch (error) {
      console.error("Failed to fetch transactions data", error);
    } finally {
      setLoading(false);
      setIsFiltering(false);
      isInitialMount.current = false;
    }
  }, [page, typeFilter, categoryFilter, dateFrom, dateTo, searchTerm]);

  // Fetch transactions when fetchData changes
  useEffect(() => {
    // This effect handles all data fetching except for debounced search
    if (isInitialMount.current) {
      fetchData(); // Fetch on initial mount
    } else {
       // Debounced search is handled separately in handleSearchChange
      if (!debounceTimer.current) {
        fetchData();
      }
    }
  }, [fetchData]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchData(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };
  
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || dateFrom || dateTo;

  const handleOpenTransactionModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleOpenDetailsModal = (transaction) => {
    setViewingDetails(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingDetails(null);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) await transactionService.updateTransaction(id, formData);
      else await transactionService.addTransaction(formData);
      fetchData();
      handleCloseTransactionModal();
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionService.deleteTransaction(id);
        // Compute the new transactions array after deletion
        setTransactions(prev => {
          const updatedTransactions = prev.filter(t => t._id !== id);
          if (updatedTransactions.length === 0 && page > 1) {
            setPage(page - 1); // useEffect will trigger fetchData
          } else {
            fetchData();
          }
          return updatedTransactions;
        });
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedTransactionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  
  const handleBulkDelete = async () => {
    if (!selectedTransactionIds.length) return;
    
    const confirmMessage = `Are you sure you want to permanently delete these ${selectedTransactionIds.length} transactions? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        await transactionService.bulkDeleteTransactions(selectedTransactionIds);
        setSelectedTransactionIds([]);
        fetchData(); // Refetch data
      } catch (error) {
        console.error('Failed to bulk delete transactions', error);
        alert('Failed to delete transactions. Please try again.');
      }
    }
  };
  const handleNewCategory = (newCategory, isIncome) => {
    if (isIncome) {
      setIncomeCategories(prev => [...prev, newCategory].sort());
    } else {
      setExpenseCategories(prev => [...prev, newCategory].sort());
    }

  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"? All associated transactions will be moved to "Miscellaneous".`)) {
      try {
        await transactionService.deleteCategory(categoryToDelete);
        fetchData();
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex flex-wrap gap-4">
          {selectedTransactionIds.length > 0 && 
            <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Delete ({selectedTransactionIds.length})
            </button>
          }
          <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Manage Categories
          </button>
          <button onClick={() => handleOpenTransactionModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <span className='text-2xl'>+</span> Add Transaction
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            title="Export all transactions to CSV"
          >
            Export to CSV
          </button>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 pointer-events-none">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full pl-14 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:col-span-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 pointer-events-none">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap justify-between items-center gap-3 mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-600">Active:</span>
              {searchTerm && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">"{searchTerm}"</span>}
              {typeFilter !== 'all' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{typeFilter === 'income' ? 'Income' : 'Expense'}</span>}
              {categoryFilter !== 'all' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{categoryFilter}</span>}
              {dateFrom && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">From: {new Date(dateFrom).toLocaleDateString()}</span>}
              {dateTo && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">To: {new Date(dateTo).toLocaleDateString()}</span>}
            </div>
            <button onClick={clearAllFilters} className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600">
              Clear Filters
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className={`bg-white shadow rounded-lg overflow-x-auto hover:shadow-lg transition-all duration-300 ${isFiltering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {transactions.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                 <th className="px-2 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-600 hover:ring-4 hover:ring-blue-200 transition-all duration-200 cursor-pointer"
                      checked={transactions.length > 0 && selectedTransactionIds.length === transactions.length}
                      disabled={transactions.length === 0}
                      onChange={() => setSelectedTransactionIds(selectedTransactionIds.length ? [] : transactions.map(t => t._id))}
                    />
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow duration-200">
                  <td className="px-2 py-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-600 hover:ring-4 hover:ring-blue-200 transition-all duration-200 cursor-pointer"
                        checked={selectedTransactionIds.includes(tx._id)}
                        onChange={() => toggleSelect(tx._id)}
                      />
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tx.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap font-semibold ${tx.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.isIncome ? '+' : '-'}{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency.code,
                    }).format(tx.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.addedOn).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenDetailsModal(tx)}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Details
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenTransactionModal(tx)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-all duration-200"
                          title="Edit transaction"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                          title="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
          <div className="p-6">
            <EmptyState message="No Transaction done" />
          </div>
                )}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button 
            onClick={() => setPage(p => Math.max(p - 1, 1))} 
            disabled={page === 1} 
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Page</span>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-medium">{page}</span>
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>
          
          <button 
            onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
            disabled={page === totalPages} 
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onNewCategory={handleNewCategory}
        currentBalance={summaryData.balance}
      />
      <ManageCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onDelete={handleDeleteCategory}
      />

      <TransactionDetailModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        transaction={viewingDetails}
        currency={currency}
      />
    </>
  );
};

export default TransactionsPage;