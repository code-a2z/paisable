import React, { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services';
import CategoryPieChart from '../components/CategoryPieChart';
import ActivityBarChart from '../components/ActivityBarChart';
import LineChart from '../components/LineChart';
import TransactionModal from '../components/TransactionModal';
import useCurrency from '../hooks/useCurrency';
import useTheme from '../hooks/useTheme';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { IoWarning } from "react-icons/io5";



// A reusable card component for the dashboard summary
const SummaryCard = ({ title, value, bgColor, loading }) => {
  const { currency } = useCurrency();
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
  }).format(value);

  return (
    <div className={`rounded-lg shadow-md p-6 ${bgColor} dark:bg-opacity-80`}>
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      {loading ? (
        <div className="mt-2 h-8 bg-gray-500 rounded animate-pulse"></div>
      ) : (
        <p className="mt-2 text-3xl font-bold text-black">{formattedValue}</p>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [categoryView, setCategoryView] = useState('expense'); // 'expense' | 'income'
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const { currency } = useCurrency();
  const { theme } = useTheme();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, chartRes, expenseCategoriesRes, incomeCategoriesRes] = await Promise.all([
        transactionService.getSummary(),
        transactionService.getCharts(),
        transactionService.getExpenseCategories(),
        transactionService.getIncomeCategories(),
      ]);
      setSummaryData(summaryRes);
      setChartData(chartRes);
      setExpenseCategories(expenseCategoriesRes || []);
      setIncomeCategories(incomeCategoriesRes || []);
      setRecentTransactions(summaryRes?.recentTransactions || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSubmit = async (formData) => {
    if (!formData.name || formData.name.trim() === "") {
      alert("Please enter a name for the transaction");
      return;
    }
    if (!formData.cost || isNaN(formData.cost) || Number(formData.cost) <= 0) {
      alert("Please enter a valid cost greater than 0");
      return;
    }
    if (!formData.category || formData.category.trim() === "") {
      alert("Please select a category");
      return;
    }

    try {
      await transactionService.addTransaction(formData);
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleNewCategory = (newCategory, isIncome) => {
    if (isIncome) {
      setIncomeCategories(prev => [...prev, newCategory].sort());
    } else {
      setExpenseCategories(prev => [...prev, newCategory].sort());
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 font-semibold bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          <span className='text-2xl'>+</span> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Income" value={summaryData.totalIncome} bgColor="bg-green-200" loading={loading} />
        <SummaryCard title="Total Expense" value={summaryData.totalExpenses} bgColor="bg-red-200" loading={loading} />
        <SummaryCard title="Current Balance" value={summaryData.balance} bgColor="bg-blue-200" loading={loading} />
      </div>

      <div className="my-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {categoryView === 'expense' ? 'Expenses by Category' : 'Income by Category'}
            </h2>
            <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Toggle category view">
              <button
                type="button"
                className={`px-3 py-1 text-sm font-medium border rounded-l-md ${categoryView === 'expense' ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                onClick={() => setCategoryView('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-sm font-medium border-t border-b rounded-r-md ${categoryView === 'income' ? 'bg-green-600 text-white border-green-600' : 'bg-transparent text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                onClick={() => setCategoryView('income')}
              >
                Income
              </button>
            </div>
          </div>
          {loading ? (
            <Spinner />
          ) : categoryView === 'expense' ? (
            chartData?.expensesByCategory?.length > 0 ? (
              <CategoryPieChart data={chartData.expensesByCategory} theme={theme} label={"Expenses by Category"} />
            ) : (
              <EmptyState message="No expense data to display." icon={<IoWarning className="w-6 h-6 text-yellow-500" />} />
            )
          ) : (
            chartData?.incomeByCategory?.length > 0 ? (
              <CategoryPieChart data={chartData.incomeByCategory} theme={theme} label={"Income by Category"} />
            ) : (
              <EmptyState message="No income data to display." icon={<IoWarning className="w-6 h-6 text-yellow-500" />} />
            )
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h2>
          <div className="relative h-80">
            {loading ? <Spinner /> : (chartData?.expensesOverTime.length > 0 || chartData?.incomeOverTime.length > 0) ? (
              <ActivityBarChart
                expensesData={chartData.expensesOverTime}
                incomeData={chartData.incomeOverTime}
                theme={theme}
              />
            ) : (
              <EmptyState message="No recent activity to display." />
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">Recent Transactions</h3>
            {loading ? <p className="text-gray-500 dark:text-gray-400 mt-2">Loading transactions...</p> : recentTransactions.length > 0 ? (
              <ul className="mt-2 space-y-3">
                {recentTransactions.map(tx => (
                  <li key={tx._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{tx.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.addedOn).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-semibold ${tx.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.isIncome ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(tx.cost)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 dark:text-gray-400 mt-2">No recent transactions.</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-[500px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Income Vs Time</h2>
          {loading ? <Spinner /> : chartData?.incomeOverTime.length > 0 ? (
            <LineChart label={"Income"} data={chartData.incomeOverTime} theme={theme} />
          ) : (
            <EmptyState message="No expense data to display." icon={<IoWarning 
                className="w-6 h-6 text-yellow-300 dark:text-yellow-400" 
                style={{ stroke: 'black', strokeWidth: 15 }} 
              />} />
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-[500px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Expense Vs Time</h2>
          {loading ? <Spinner /> : chartData?.expensesOverTime.length > 0 ? (
            <LineChart label={"Expenses"} data={chartData.expensesOverTime} theme={theme} />
          ) : (
            <EmptyState message="No expense data to display." icon={<IoWarning 
                className="w-6 h-6 text-yellow-300 dark:text-yellow-400" 
                style={{ stroke: 'black', strokeWidth: 15 }} 
              />} />
          )}
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFormSubmit} expenseCategories={expenseCategories}
        incomeCategories={incomeCategories} onNewCategory={handleNewCategory} currentBalance={summaryData.balance} />
    </>
  );
};

export default DashboardPage;
