const Feedback = require('../models/Feedback');

// @desc    Submit user feedback
// @route   POST /api/feedback
// @access  Public / Optional Auth
const submitFeedback = async (req, res) => {
  try {
    const { name, email, rating, category, message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Feedback message is required' });
    }

    const feedbackData = {
      name: name || (req.user ? req.user.name || req.user.email : 'Anonymous'),
      email: email || (req.user ? req.user.email : ''),
      rating: Number(rating) || 5,
      category: category || 'General Feedback',
      message: message.trim(),
    };

    if (req.user && (req.user._id || req.user.id)) {
      feedbackData.user = req.user._id || req.user.id;
    }

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({
      message: 'Feedback submitted successfully! Thank you for helping us improve Paisable.',
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all feedback (for admin / summary)
// @route   GET /api/feedback
// @access  Private
const getFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getFeedback,
};
