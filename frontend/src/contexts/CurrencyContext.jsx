import React, { createContext, useState, useEffect } from 'react';
import { supportedCurrencies } from '../config/currencies';
import useAuth from '../hooks/useAuth';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const savedCode = localStorage.getItem('currencyCode');
    if (savedCode) {
      const found = supportedCurrencies.find(c => c.code === savedCode);
      if (found) return found;
    }
    return supportedCurrencies[0];
  });

  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    if (user?.defaultCurrency) {
      const userCurrency = supportedCurrencies.find(c => c.code === user.defaultCurrency);
      if (userCurrency) {
        setCurrency(userCurrency);
        localStorage.setItem('currencyCode', userCurrency.code);
      }
    }
  }, [user]);

  const changeCurrency = (currencyCodeOrObj) => {
    const code = typeof currencyCodeOrObj === 'string' ? currencyCodeOrObj : currencyCodeOrObj?.code;
    const newCurrency = supportedCurrencies.find(c => c.code === code);
    if (newCurrency) {
      setCurrency(newCurrency);
      localStorage.setItem('currencyCode', newCurrency.code);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, supportedCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;