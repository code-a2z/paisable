import React, { useState, useEffect, useCallback } from 'react';
import Spinner from '../components/Spinner';
import useCurrency from '../hooks/useCurrency';
import BudgetModal from '../components/BudgetModal';
import EmptyState from '../components/EmptyState';
import { budgetService, transactionService } from '../services';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        budgetService.getBudgets(),
        transactionService.getExpenseCategories(),
        transactionService.getTransactions(),
      ]);
      setBudgets(budgetsData || []);
      setCategories(categoriesData || []);
      setTransactions(transactionsData?.transactions || []);
    } catch (error) {
      console.error('Failed to fetch budgets or transactions', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenBudgetModal = (budget = null) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) await budgetService.updateBudget(id, formData);
      else await budgetService.addBudget(formData);
      fetchData();
      handleCloseBudgetModal();
    } catch (error) {
      console.error('Failed to save budget', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.deleteBudget(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete budget', error);
      }
    }
  };

  const calculateSpent = (budget) => {
    return transactions
      .filter((tx) => {
        const txDate = new Date(tx.addedOn);
        return (
          tx.category === budget.category &&
          txDate.getMonth() + 1 === budget.month &&
          txDate.getFullYear() === budget.year
        );
      })
      .reduce((sum, tx) => sum + tx.cost, 0);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Budgets</h1>
        <div className="flex gap-4">
          <button
            onClick={() => handleOpenBudgetModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Budget
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : budgets.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto hover:shadow-lg transition-all duration-300">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {budgets.map((b) => {
                const spent = calculateSpent(b);
                const remaining = b.amount - spent;
                const percent = Math.min((spent / b.amount) * 100, 100).toFixed(
                  1
                );

                return (
                  <tr key={b._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {b.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100">{`${b.month}/${b.year}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(b.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(spent)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-semibold ${
                        remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-1/3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            percent < 80
                              ? 'bg-green-500'
                              : percent < 100
                              ? 'bg-yellow-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{percent}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <BudgetModal
            isOpen={isBudgetModalOpen}
            onClose={handleCloseBudgetModal}
            onSubmit={handleFormSubmit}
            budget={editingBudget}
            categories={categories}
          />
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
          <EmptyState message="No budgets found" />
        </div>
      )}
    </>
  );
};

export default Budgets;
