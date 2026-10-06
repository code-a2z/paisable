const User = require('../models/User');
const IncomeExpense = require('../models/IncomeExpense');
const Receipt = require('../models/Receipt');

const bcrypt = require('bcryptjs');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile & personalization preferences
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, bio, phone, occupation, avatar, defaultCurrency, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (occupation !== undefined) user.occupation = occupation;
    if (avatar !== undefined) user.avatar = avatar;
    if (defaultCurrency !== undefined) user.defaultCurrency = defaultCurrency;
    
    if (preferences) {
      user.preferences = {
        ...user.preferences?.toObject(),
        ...preferences,
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      occupation: updatedUser.occupation,
      avatar: updatedUser.avatar,
      defaultCurrency: updatedUser.defaultCurrency,
      preferences: updatedUser.preferences,
      isSetupComplete: updatedUser.isSetupComplete,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete the logged-in user's account and all their data
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // Delete all IncomeExpense documents for the user
    await IncomeExpense.deleteMany({ user: userId });

    // Delete all Receipt documents for the user
    await Receipt.deleteMany({ user: userId });

    // Delete the user document
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};