const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
} = require('../controllers/feedbackController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Submit feedback (authenticated or guest)
router.post('/', optionalProtect, submitFeedback);

// View logged-in user's submissions
router.get('/my', protect, getMyFeedback);

// View all feedback (protected)
router.get('/', protect, getAllFeedback);

module.exports = router;
