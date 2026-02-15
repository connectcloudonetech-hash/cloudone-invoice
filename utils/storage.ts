
import { Currency } from '../types';

/**
 * Shared Formatting Utilities
 */

/**
 * Standard currency formatter for UI (includes symbols)
 */
export const formatCurrency = (amount: number, currency: Currency = Currency.AED) => {
  const locale = currency === Currency.AED ? 'en-AE' : 'en-IN';
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currency,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Safe currency formatter for PDF generation (no symbols to avoid font encoding issues)
 */
export const formatCurrencyValueOnly = (amount: number, currency: Currency = Currency.AED) => {
  const locale = currency === Currency.AED ? 'en-AE' : 'en-IN';
  return new Intl.NumberFormat(locale, { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * ID Generation for non-database temporary objects
 */
export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * System state utilities (Now primarily for preferences)
 */
export const db = {
  getPreferences: () => {
    return {
      currency: localStorage.getItem('cot_preferred_currency') || Currency.AED,
    };
  },
  clearPreferences: () => {
    localStorage.removeItem('cot_preferred_currency');
  }
};
