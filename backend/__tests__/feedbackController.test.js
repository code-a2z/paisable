const request = require('supertest');
const express = require('express');
const {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
} = require('../controllers/feedbackController');
const Feedback = require('../models/Feedback');

// Setup mock express app
const app = express();
app.use(express.json());

const mockUser = { _id: 'user_test_123', email: 'test@example.com' };

const mockAuthMiddleware = (req, res, next) => {
  req.user = mockUser;
  next();
};

const mockOptionalAuthMiddleware = (req, res, next) => {
  if (req.headers.authorization) {
    req.user = mockUser;
  }
  next();
};

app.post('/api/feedback', mockOptionalAuthMiddleware, submitFeedback);
app.get('/api/feedback/my', mockAuthMiddleware, getMyFeedback);
app.get('/api/feedback', mockAuthMiddleware, getAllFeedback);

jest.mock('../models/Feedback');

describe('Feedback Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/feedback', () => {
    it('should successfully submit thoughts feedback', async () => {
      const mockFeedbackData = {
        category: 'thoughts',
        title: 'Loving the app!',
        message: 'The UI is very intuitive and clean.',
        rating: 5,
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      Feedback.create.mockResolvedValueOnce({
        _id: 'feedback_1',
        ...mockFeedbackData,
        user: null,
        status: 'pending',
      });

      const response = await request(app)
        .post('/api/feedback')
        .send(mockFeedbackData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.feedback).toBeDefined();
      expect(response.body.feedback.title).toBe('Loving the app!');
    });

    it('should successfully submit an issue report with authenticated user', async () => {
      const mockIssue = {
        category: 'issue',
        title: 'Error exporting CSV',
        message: 'Clicking export throws an unexpected error on Firefox.',
        rating: 2,
      };

      Feedback.create.mockResolvedValueOnce({
        _id: 'feedback_2',
        ...mockIssue,
        user: mockUser._id,
        email: mockUser.email,
        status: 'pending',
      });

      const response = await request(app)
        .post('/api/feedback')
        .set('Authorization', 'Bearer dummy-token')
        .send(mockIssue);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(Feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'issue',
          user: mockUser._id,
          email: mockUser.email,
        })
      );
    });

    it('should successfully submit an improvement suggestion', async () => {
      const mockSuggestion = {
        category: 'improvement',
        title: 'Add dark mode schedule',
        message: 'It would be great to toggle dark mode automatically at sunset.',
        rating: 4,
      };

      Feedback.create.mockResolvedValueOnce({
        _id: 'feedback_3',
        ...mockSuggestion,
        status: 'pending',
      });

      const response = await request(app)
        .post('/api/feedback')
        .send(mockSuggestion);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject submission with invalid category', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send({
          category: 'invalid_cat',
          title: 'Hello',
          message: 'World',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('category');
    });

    it('should reject submission with missing title', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send({
          category: 'thoughts',
          title: '   ',
          message: 'Some feedback',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Title');
    });

    it('should reject submission with missing message', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send({
          category: 'thoughts',
          title: 'Great App',
          message: '   ',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('details');
    });

    it('should reject submission with invalid rating (< 1 or > 5)', async () => {
      const response = await request(app)
        .post('/api/feedback')
        .send({
          category: 'thoughts',
          title: 'Great App',
          message: 'I really like this app',
          rating: 6,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Rating must be a number between 1 and 5');
    });
  });

  describe('GET /api/feedback/my', () => {
    it('should return feedback submitted by current user', async () => {
      const mockFeedbacks = [
        {
          _id: 'fb1',
          user: mockUser._id,
          category: 'improvement',
          title: 'Multi-currency support',
          message: 'More currencies please',
          rating: 4,
          status: 'reviewed',
          createdAt: new Date(),
        },
      ];

      Feedback.find.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(mockFeedbacks),
      });

      const response = await request(app).get('/api/feedback/my');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Multi-currency support');
    });
  });
});
