import React, { createContext, useState, useEffect, useContext } from 'react';

const CurrencyContext = createContext({
  currency: 'EUR',
  rates: { EUR: 1 },
  setCurrency: () => {},
  convert: (amount) => amount,
  format: (amount) => amount.toString(),
});

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('currency') || 'EUR'
  );
  const [rates, setRates] = useState({ EUR: 1 });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log('✅ Fetched rates:', data.rates);
        setRates({ EUR: 1, ...data.rates });
      } catch (err) {
        console.error('❌ Failed to load exchange rates:', err);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const convert = (amountInEur) => {
    const rate = rates?.[currency] ?? 1;
    return amountInEur * rate;
  };

  const SYMBOL_OVERRIDES = {
    UAH: '₴',
  };

  const format = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,                
      currencyDisplay: 'narrowSymbol',
    }).format(amount);

    return formatted.replace(currency, SYMBOL_OVERRIDES[currency] || currency);
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, rates, setCurrency, convert, format }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
