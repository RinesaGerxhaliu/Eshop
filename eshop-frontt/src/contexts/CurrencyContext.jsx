// src/contexts/CurrencyContext.jsx
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

  // Fetch live rates once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log('✅ Fetched rates:', data.rates);
        // merge so EUR:1 is always present
        setRates({ EUR: 1, ...data.rates });
      } catch (err) {
        console.error('❌ Failed to load exchange rates:', err);
      }
    })();
  }, []);

  // Persist selected currency
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Convert an amount in EUR to the selected currency
  const convert = (amountInEur) => {
    const rate = rates?.[currency] ?? 1;
    return amountInEur * rate;
  };

  // Some currencies (like UAH) may not get a native symbol in en-US,
  // so we override just those few that need it.
  const SYMBOL_OVERRIDES = {
    UAH: '₴',
    // add others here if needed
  };

  // Format a numeric amount to a currency string, using narrowSymbol if available,
  // then replacing the code with our override if Intl fell back to the code.
  const format = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,                // e.g. 'USD', 'EUR', 'JPY', 'UAH'
      currencyDisplay: 'narrowSymbol',
    }).format(amount);

    // If Intl fell back to printing the code (e.g. "UAH"), swap it out
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
