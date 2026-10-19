const Feedback = require('../models/Feedback');

/**
 * @desc    Submit new feedback (thoughts, issue report, or improvement suggestion)
 * @route   POST /api/feedback
 * @access  Public / Optional Authenticated
 */
const submitFeedback = async (req, res) => {
  try {
    const { category, title, message, rating, name, email } = req.body;

    if (!category || !['thoughts', 'issue', 'improvement'].includes(category)) {
      return res.status(400).json({
        message: 'Invalid or missing category. Must be "thoughts", "issue", or "improvement".',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title or subject is required.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Feedback details/message is required.' });
    }

    let parsedRating = null;
    if (rating !== undefined && rating !== null && rating !== '') {
      parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
      }
    }

    const userId = req.user ? req.user._id : null;
    const submitterEmail = req.user?.email || (typeof email === 'string' ? email.trim() : '');
    const submitterName = typeof name === 'string' ? name.trim() : '';

    const feedback = await Feedback.create({
      user: userId,
      category,
      title: title.trim(),
      message: message.trim(),
      rating: parsedRating,
      name: submitterName,
      email: submitterEmail,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your submission helps make Paisable better.',
      feedback,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Server error while submitting feedback', error: error.message });
  }
};

/**
 * @desc    Get current user's submitted feedback
 * @route   GET /api/feedback/my
 * @access  Private
 */
const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ message: 'Server error retrieving feedback', error: error.message });
  }
};

/**
 * @desc    Get all feedback (for admin review / analytics)
 * @route   GET /api/feedback
 * @access  Private
 */
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: 'Server error retrieving feedback list', error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
};
