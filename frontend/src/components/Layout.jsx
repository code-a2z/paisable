import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    return `${baseClasses} text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white`;
  };

  const getMobileNavLinkClass = ({ isActive }) => {
    const baseClasses = 'block px-3 py-2 rounded-md text-base font-medium transition-colors';
    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    return `${baseClasses} text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white`;
  };

  const handleClick = () => {
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span
                onClick={handleClick}
                className="font-bold text-xl text-blue-600 dark:text-blue-400 cursor-pointer transition-all duration-500 hover:scale-105 hover:drop-shadow-lg hover:text-blue-500 dark:hover:text-blue-300"
                title="Go to home"
              >
                Paisable
              </span>

              <div className="hidden lg:block">
                <div className="ml-10 flex items-baseline space-x-4">
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
                    Settings
                  </NavLink>
                  <NavLink to="/feedback" className={getNavLinkClass}>
                    Feedback
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <CurrencySelector />
              <button
                onClick={logout}
                className="hidden sm:inline-flex bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 px-4 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800">
            <NavLink
              to="/dashboard"
              className={getMobileNavLinkClass}
              onClick={closeMobileMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={getMobileNavLinkClass}
              onClick={closeMobileMenu}
            >
              Transactions
            </NavLink>
            <NavLink
              to="/receipts"
              className={getMobileNavLinkClass}
              onClick={closeMobileMenu}
            >
              Receipts
            </NavLink>
            <NavLink
              to="/budgets"
              className={getMobileNavLinkClass}
              onClick={closeMobileMenu}
            >
              Budgets
            </NavLink>
            <NavLink
              to="/recurring-transactions"
              className={getMobileNavLinkClass}
              onClick={closeMobileMenu}
            >
              Recurring Transactions
            </NavLink>
            <NavLink
              to="/settings"
              className={getMobileNavLinkClass}
              onClick={closeMobileMenu}
            >
              Settings
            </NavLink>
            <NavLink
              to="/feedback"
              className={getMobileNavLinkClass}
              onClick={closeMobileMenu}
            >
              Feedback
            </NavLink>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  closeMobileMenu();
                  logout();
                }}
                className="w-full text-left bg-red-500 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
