import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import FeedbackPage from './FeedbackPage';
import AuthContext from '../contexts/AuthContext';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FeedbackPage Component', () => {
  const mockAuthContext = {
    user: { _id: 'user_1', email: 'test@example.com' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the feedback header and feedback categories', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <FeedbackPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Feedback & Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Share Thoughts')).toBeInTheDocument();
    expect(screen.getByText('Report an Issue')).toBeInTheDocument();
    expect(screen.getByText('Suggest Improvement')).toBeInTheDocument();
  });

  it('allows user to switch category to "Report an Issue"', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <FeedbackPage />
      </AuthContext.Provider>
    );

    const issueButton = screen.getByRole('button', { name: /report an issue/i });
    fireEvent.click(issueButton);

    const titleInput = screen.getByLabelText(/subject \/ summary/i);
    expect(titleInput).toBeInTheDocument();
  });

  it('submits feedback successfully when valid data is entered', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Feedback submitted successfully',
      },
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <FeedbackPage />
      </AuthContext.Provider>
    );

    const titleInput = screen.getByLabelText(/subject \/ summary/i);
    const messageInput = screen.getByLabelText(/feedback details/i);
    const submitBtn = screen.getByRole('button', { name: /submit feedback/i });

    fireEvent.change(titleInput, { target: { value: 'Great charts' } });
    fireEvent.change(messageInput, { target: { value: 'The monthly breakdown charts are fantastic.' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/feedback',
        expect.objectContaining({
          category: 'thoughts',
          title: 'Great charts',
          message: 'The monthly breakdown charts are fantastic.',
        })
      );
    });
  });
});
