const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  category: {
    type: String,
    enum: ['General Feedback', 'Bug Report', 'Feature Request', 'UI / Experience', 'Other'],
    default: 'General Feedback',
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
