'use client';

import React from 'react';
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';
import { Globe } from 'lucide-react';

export function CurrencySelector({ variant = 'navbar' }: { variant?: 'navbar' | 'announcement' | 'footer' }) {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  if (variant === 'announcement') {
    return (
      <div className="flex items-center space-x-1.5 text-[11px] font-orbitron">
        <span className="text-purple-400 font-medium">CURRENCY:</span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
          className="bg-purple-950/80 border border-purple-800/60 text-purple-200 rounded px-1.5 py-0.5 text-[10px] font-orbitron font-semibold focus:outline-none focus:border-purple-400 cursor-pointer"
          aria-label="Select Currency"
        >
          {availableCurrencies.map((c) => (
            <option key={c.code} value={c.code} className="bg-[#1C122C] text-white">
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-brand-border bg-white hover:border-brand transition-colors text-content-secondary text-xs font-orbitron">
        <Globe className="w-3 h-3 text-brand" />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
          className="bg-transparent text-content-primary font-semibold text-xs focus:outline-none cursor-pointer pr-1"
          aria-label="Select store currency"
        >
          {availableCurrencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
