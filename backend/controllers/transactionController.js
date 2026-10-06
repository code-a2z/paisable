const IncomeExpense = require('../models/IncomeExpense');
const Papa = require('papaparse');
// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  const { name, category, cost, addedOn, isIncome, note } = req.body;

  try {
    const transaction = new IncomeExpense({
      user: req.user.id,
      name,
      category,
      cost,
      addedOn,
      isIncome,
      note
    });

    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all transactions for a user with filtering and pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { search, isIncome, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user.id, isDeleted: false };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (isIncome) filter.isIncome = isIncome;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.addedOn = {};
      if (startDate) filter.addedOn.$gte = new Date(startDate);
      if (endDate) filter.addedOn.$lte = new Date(endDate);
    }

    const transactions = await IncomeExpense.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ addedOn: -1 });

    const count = await IncomeExpense.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await IncomeExpense.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if the transaction belongs to the user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { name, category, cost, addedOn, isIncome, note } = req.body;
    transaction.name = name || transaction.name;
    transaction.category = category || transaction.category;
    transaction.cost = cost || transaction.cost;
    transaction.addedOn = addedOn || transaction.addedOn;
    transaction.isIncome = (isIncome !== undefined) ? isIncome : transaction.isIncome;
    transaction.note = note || transaction.note;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a transaction (soft delete)
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await IncomeExpense.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    transaction.isDeleted = true;
    await transaction.save();

    res.json({ message: 'Transaction removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Bulk delete transactions
// @route   DELETE /api/transactions/bulk
// @access  Private
const bulkDeleteTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ message: 'Transaction IDs array is required' });
    }

    // Verify all transactions belong to the user and exist
    const transactions = await IncomeExpense.find({
      _id: { $in: transactionIds },
      user: req.user.id,
      isDeleted: false
    });

    if (transactions.length !== transactionIds.length) {
      return res.status(404).json({ 
        message: 'Some transactions not found or not authorized' 
      });
    }

    // Mark all transactions as deleted
    const result = await IncomeExpense.updateMany(
      {
        _id: { $in: transactionIds },
        user: req.user.id
      },
      { isDeleted: true }
    );

    res.json({ 
      message: `${result.modifiedCount} transactions deleted successfully`,
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get transaction summary for a user
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = async (req, res) => {
  try {
    const summary = await IncomeExpense.aggregate([
      { $match: { user: req.user._id, isDeleted: false } },
      { $group: { _id: '$isIncome', total: { $sum: '$cost' } } },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    summary.forEach(group => {
      if (group._id === true) {
        totalIncome = group.total;
      } else {
        totalExpenses = group.total;
      }
    });

    const balance = totalIncome - totalExpenses;
    // 5 most recent transactions
    const recentTransactions = await IncomeExpense.find({ user: req.user._id, isDeleted: false })
      .sort({ addedOn: -1 }) // Sort by date descending
      .limit(5);

    // Add recentTransactions to the JSON response
    res.json({ totalIncome, totalExpenses, balance, recentTransactions });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get data for charts
// @route   GET /api/transactions/charts
// @access  Private
const getChartData = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Optional date range from query for category aggregations
    const { startDate, endDate } = req.query;
    let dateMatch = {};
    if (startDate || endDate) {
      dateMatch.addedOn = {};
      if (startDate) dateMatch.addedOn.$gte = new Date(startDate);
      if (endDate) dateMatch.addedOn.$lte = new Date(endDate);
    }

    // Data for Expenses by Category (Pie Chart)
    const expensesByCategory = await IncomeExpense.aggregate([
      { $match: { user: userId, isIncome: false, isDeleted: false, ...(dateMatch.addedOn ? { addedOn: dateMatch.addedOn } : {}) } },
      { $group: { _id: '$category', total: { $sum: '$cost' } } },
      { $project: { name: '$_id', total: 1, _id: 0 } }
    ]);

    // Data for Income by Category (Pie Chart)
    const incomeByCategory = await IncomeExpense.aggregate([
      { $match: { user: userId, isIncome: true, isDeleted: false, ...(dateMatch.addedOn ? { addedOn: dateMatch.addedOn } : {}) } },
      { $group: { _id: '$category', total: { $sum: '$cost' } } },
      { $project: { name: '$_id', total: 1, _id: 0 } }
    ]);

    // Data for Expenses Over Time (Bar Chart)
    const expensesOverTime = await IncomeExpense.aggregate([
      { $match: { user: userId, isIncome: false, isDeleted: false, addedOn: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$addedOn" } },
          total: { $sum: '$cost' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', total: 1, _id: 0 } }
    ]);

    // Data for Income Over Time (Bar Chart)
    const incomeOverTime = await IncomeExpense.aggregate([
      { $match: { user: userId, isIncome: true, isDeleted: false, addedOn: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$addedOn" } },
          total: { $sum: '$cost' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', total: 1, _id: 0 } }
    ]);

    res.json({ expensesByCategory, incomeByCategory, expensesOverTime, incomeOverTime });
  } catch (error) {
    // Also log the error to the backend console for easier debugging
    console.error('Error in getChartData:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all unique categories for a user
// @route   GET /api/transactions/categories
// @access  Private
const getExpenseCategories = async (req, res) => {
  try {
    // 1. Define a list of default categories
    const defaultExpenseCategories = [
      'Food',
      'Shopping',
      'Bills',
      'Subscriptions',
      'Transportation',
      'Entertainment',
      'Groceries',
      'Miscellaneous'
    ];

    // 2. Get the user's custom categories from the database
    const userExpenseCategories = await IncomeExpense.distinct('category', { user: req.user._id, isIncome: false });

    // 3. Combine, de-duplicate, and sort the lists
    const combinedCategories = [...new Set([...defaultExpenseCategories, ...userExpenseCategories])];
    combinedCategories.sort();

    res.json(combinedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all unique categories for user income
// @route   GET /api/transactions/categories/income
// @access  Private
const getIncomeCategories = async (req, res) => {
  try {
    const defaultIncomeCategories = [
      'Salary',
      'Freelance / Side Gig',
      'Investment Returns',
      'Gifts',
      'Refunds'
    ];

    // 2. Get the user's custom income categories from the database
    const userIncomeCategories = await IncomeExpense.distinct('category', {
      user: req.user._id,
      isIncome: true
    });

    // 3. Combine, de-duplicate, and sort
    const combinedCategories = [...new Set([...defaultIncomeCategories, ...userIncomeCategories])];
    combinedCategories.sort();

    res.json(combinedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a user-defined category
// @route   DELETE /api/transactions/category
// @access  Private
const deleteCategory = async (req, res) => {
  const { categoryToDelete } = req.body;

  if (!categoryToDelete) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    // Re-assign all transactions with this category to 'Miscellaneous'
    await IncomeExpense.updateMany(
      { user: req.user._id, category: categoryToDelete },
      { $set: { category: 'Miscellaneous' } }
    );

    res.json({ message: `Category '${categoryToDelete}' deleted successfully. Associated transactions moved to 'Miscellaneous'.` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const exportTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transactions = await IncomeExpense.find({ user: userId, isDeleted: false }).lean();

    const csvData = transactions.map(({ _id, user, name, category, cost, addedOn, isIncome }) => ({
      id: _id,
      user,
      name,
      category,
      cost,
      addedOn,
      isIncome,
    }));

    // Use Papa.unparse directly with explicit columns for reliability even on empty datasets
    const csv = Papa.unparse(csvData, {
      header: true,
      columns: ['id', 'user', 'name', 'category', 'cost', 'addedOn', 'isIncome'],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="paisable_transactions.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  getTransactionSummary,
  getChartData,
  getExpenseCategories,
  getIncomeCategories,
  deleteCategory,
  exportTransactions,
};