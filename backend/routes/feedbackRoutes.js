const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

// Optional auth helper middleware for public or logged-in submission
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, submitFeedback);
router.get('/', protect, getFeedback);

module.exports = router;
