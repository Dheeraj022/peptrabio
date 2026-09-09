'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rate: number; // Conversion rate relative to USD (1 USD = rate in target currency)
  decimals: number;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'INR (₹)',
    rate: 86.5, // 1 USD ≈ 86.50 INR
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'USD ($)',
    rate: 1.0,
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'EUR (€)',
    rate: 0.92,
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'GBP (£)',
    rate: 0.79,
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'CAD ($)',
    rate: 1.36,
    decimals: 2,
  },
};

type CurrencyContextType = {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  currencyConfig: CurrencyConfig;
  availableCurrencies: CurrencyConfig[];
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'peptrabio_currency_v2';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('INR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as SupportedCurrency;
      if (stored && CURRENCIES[stored]) {
        setCurrencyState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = (curr: SupportedCurrency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
    } catch {
      // ignore
    }
  };

  const currentConfig = CURRENCIES[currency] || CURRENCIES.INR;

  const convertPrice = (amountInUSD: number): number => {
    const rate = currentConfig.rate;
    return amountInUSD * rate;
  };

  const formatPrice = (amountInUSD: number): string => {
    if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
      return `${currentConfig.symbol}0.00`;
    }
    const converted = convertPrice(amountInUSD);
    
    // Format based on locale for neat thousands separators
    if (currency === 'INR') {
      return `₹${converted.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `${currentConfig.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: currentConfig.decimals,
      maximumFractionDigits: currentConfig.decimals,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currencyConfig: currentConfig,
        availableCurrencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currency: 'INR' as SupportedCurrency,
      setCurrency: () => {},
      formatPrice: (amount: number) => `₹${((amount || 0) * 86.5).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      convertPrice: (amount: number) => (amount || 0) * 86.5,
      currencyConfig: CURRENCIES.INR,
      availableCurrencies: Object.values(CURRENCIES),
    };
  }
  return context;
}
