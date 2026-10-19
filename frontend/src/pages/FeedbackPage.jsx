import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const CATEGORIES = [
  {
    id: 'thoughts',
    label: 'Share Thoughts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    description: 'Share your general experience, praise, or overall thoughts on Paisable.',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    activeColor: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'issue',
    label: 'Report an Issue',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    description: 'Found a bug, glitch, or calculation error? Let us know so we can fix it.',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    activeColor: 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  },
  {
    id: 'improvement',
    label: 'Suggest Improvement',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    description: 'Propose new features, smart enhancements, or UX ideas for Paisable.',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    activeColor: 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300',
  },
];

const FeedbackPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'history'
  const [category, setCategory] = useState('thoughts');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myFeedbackList, setMyFeedbackList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const fetchMyFeedback = async () => {
    if (!user) return;
    try {
      setLoadingHistory(true);
      const res = await api.get('/feedback/my');
      setMyFeedbackList(res?.data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyFeedback();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please provide a subject/title.');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter your feedback message.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        category,
        title: title.trim(),
        message: message.trim(),
        rating: rating > 0 ? rating : null,
        name: name.trim(),
        email: email.trim(),
      };

      const res = await api.post('/feedback', payload);
      toast.success(res.data.message || 'Thank you! Your feedback has been received.');

      // Reset form fields
      setTitle('');
      setMessage('');
      setRating(0);
      setHoverRating(0);

      // Refresh list if logged in
      if (user) {
        fetchMyFeedback();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const getPlaceholder = () => {
    if (category === 'thoughts') {
      return 'What do you like most about Paisable? How has it helped you track your spending?';
    }
    if (category === 'issue') {
      return 'Please describe what went wrong, steps to reproduce, or any error messages you observed.';
    }
    return 'Describe the new feature or improvement you would like to see and why it would be helpful.';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Feedback & Suggestions
        </h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          We want to hear from you! Share your thoughts, report issues you encountered, or suggest improvements to help us make Paisable better.
        </p>

        {/* Tab switcher for logged-in users */}
        {user && (
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-lg bg-gray-200 dark:bg-gray-800 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'submit'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Give Feedback
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                My Submissions {myFeedbackList.length > 0 && `(${myFeedbackList.length})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'submit' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">
                1. Select Feedback Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? cat.activeColor
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          {cat.icon}
                        </span>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {cat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                2. Rate Your Overall Experience <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star === rating ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                      aria-label={`${star} star`}
                    >
                      <svg
                        className={`w-7 h-7 ${
                          filled
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  );
                })}
                {rating > 0 && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2">
                    {rating === 1 && '1 - Needs Improvement'}
                    {rating === 2 && '2 - Fair'}
                    {rating === 3 && '3 - Good'}
                    {rating === 4 && '4 - Very Good'}
                    {rating === 5 && '5 - Excellent!'}
                  </span>
                )}
              </div>
            </div>

            {/* Title / Subject */}
            <div>
              <label
                htmlFor="feedback-title"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1"
              >
                3. Subject / Summary <span className="text-red-500">*</span>
              </label>
              <input
                id="feedback-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                placeholder={
                  category === 'thoughts'
                    ? 'e.g., Loving the receipt OCR feature!'
                    : category === 'issue'
                    ? 'e.g., Error occurs when exporting transactions'
                    : 'e.g., Option to set monthly recurring budget alerts'
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {title.length}/200
              </div>
            </div>

            {/* Message / Details */}
            <div>
              <label
                htmlFor="feedback-message"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1"
              >
                4. Feedback Details <span className="text-red-500">*</span>
              </label>
              <textarea
                id="feedback-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={3000}
                required
                placeholder={getPlaceholder()}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {message.length}/3000
              </div>
            </div>

            {/* Optional contact info for guests */}
            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <label
                    htmlFor="feedback-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Name <span className="text-xs text-gray-400">(Optional)</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="feedback-email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Email <span className="text-xs text-gray-400">(Optional)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Feedback</span>
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* History Tab */
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="flex justify-center items-center py-12">
              <Spinner />
            </div>
          ) : myFeedbackList.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No feedback submitted yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Whenever you share thoughts, report issues, or suggest improvements, they will show up here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Submit Your First Feedback
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {myFeedbackList.map((item) => {
                const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0];
                return (
                  <div
                    key={item._id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${catObj.badgeColor}`}
                        >
                          {catObj.icon}
                          {catObj.label}
                        </span>
                        {item.rating && (
                          <div className="flex items-center text-yellow-400 text-xs">
                            {'★'.repeat(item.rating)}
                            {'☆'.repeat(5 - item.rating)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {item.message}
                    </p>

                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500">
                      <span>Status:</span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded capitalize ${
                          item.status === 'resolved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : item.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
