import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import WelcomePage from './pages/WelcomePage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import Budgets from './pages/Budgets';
import ContactUs from './pages/ContactUs';
import FeedbackPage from './pages/FeedbackPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SetupProtectedRoute from './components/SetupProtectedRoute';
import RecurringTransactions from './pages/RecurringTransactions';
import BackToTop from './components/BackToTop';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Protected Routes */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupPage />
            </ProtectedRoute>
          }
        />
        {/* Protected Routes Wrapper */}
        <Route
          element={
            <SetupProtectedRoute>
              <Layout />
            </SetupProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route
            path="/recurring-transactions"
            element={<RecurringTransactions />}
          />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BackToTop />
      <ToastContainer />
    </>
  );
}

export default App;
