import React, { useState, useEffect } from 'react';
import useCurrency from '../hooks/useCurrency';
import useAuth from '../hooks/useAuth';

const CurrencySelector = () => {
  const { currency, changeCurrency, supportedCurrencies } = useCurrency();
  const auth = useAuth();
  const user = auth?.user;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.defaultCurrency) {
      const userCurrency = supportedCurrencies.find(c => c.code === user.defaultCurrency);
      changeCurrency(userCurrency);
    }
  }, [user]);

  const handleSelect = (code) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <span>{currency.flag}</span>
        <span className="font-medium text-sm">{currency.code}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
          <ul className="py-1">
            {supportedCurrencies.map(curr => (
              <li 
                key={curr.code} 
                onClick={() => handleSelect(curr.code)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <span>{curr.flag}</span>
                <span>{curr.name} ({curr.code})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;