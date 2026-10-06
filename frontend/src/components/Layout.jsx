import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';
import BackToTop from './BackToTop';
import FeedbackModal from './FeedbackModal';
import { MessageSquare } from 'lucide-react';

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white shadow-sm`;
    }
    return `${baseClasses} text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white`;
  };

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span
                onClick={handleClick}
                className="font-bold text-xl text-blue-600 dark:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
                title="Go to home"
              >
                Paisable
              </span>

              <div className="hidden lg:block">
                <div className="ml-8 flex items-baseline space-x-2">
                  <NavLink to="/dashboard" className={getNavLinkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/transactions" className={getNavLinkClass}>
                    Transactions
                  </NavLink>
                  <NavLink to="/receipts" className={getNavLinkClass}>
                    Receipts
                  </NavLink>
                  <NavLink to="/budgets" className={getNavLinkClass}>
                    Budgets
                  </NavLink>
                  <NavLink
                    to="/recurring-transactions"
                    className={getNavLinkClass}
                  >
                    Recurring Transactions
                  </NavLink>
                  <NavLink to="/settings" className={getNavLinkClass}>
                    Settings & Profile
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                title="Send Feedback"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Feedback</span>
              </button>
              <ThemeToggle />
              <CurrencySelector />
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Paisable. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
            >
              Give Feedback
            </button>
            <NavLink to="/contact" className="hover:underline text-xs">
              Contact Support
            </NavLink>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};

export default Layout;
