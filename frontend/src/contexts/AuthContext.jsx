import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [pendingToast, setPendingToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          // Check if the token is valid by fetching user data via authService
          const data = await authService.getMe();
          setUser(data);
        } catch (error) {
          // Clear invalid token
          console.error("Token verification failed", error);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false); // Finished checking
    };
    verifyUser();
  }, []);

  // Show pending toast after redirect
  useEffect(() => {
    if (pendingToast) {
      toast[pendingToast.type](pendingToast.message);
      setPendingToast(null);
    }
  }, [pendingToast]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      const { token: newToken, ...userData } = data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setPendingToast({ type: 'success', message: 'Login successful!' });
      if (!userData.isSetupComplete) {
        navigate('/setup');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed', error.response?.data);
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      setPendingToast({ type: 'error', message: msg });
      throw new Error(msg);
    }
  };

  const signup = async (email, password) => {
    try {
      const data = await authService.signup(email, password);
      const { token: newToken, ...userData } = data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setPendingToast({ type: 'success', message: 'Signup successful!' });
      navigate('/setup');
    } catch (error) {
      console.error('Signup failed', error.response?.data);
      const msg = error.response?.data?.message || 'Signup failed. Please try again.';
      setPendingToast({ type: 'error', message: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    setPendingToast({ type: 'info', message: 'Logged out successfully.' });
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const setup = async (defaultCurrency) => {
    try {
      const data = await authService.completeSetup({ defaultCurrency });
      setUser(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Setup failed', error);
      throw new Error(error.response?.data?.message || 'Setup failed. Please try again.');
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, setup, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;