// Currency utility module — replaces all hardcoded formatCurrency functions

export type CurrencyCode = 'CAD' | 'USD' | 'INR' | 'GBP' | 'AUD' | 'EUR';
export type DisplayStyle = 'symbol' | 'code' | 'both';

export interface CurrencySettings {
  baseCurrency: CurrencyCode;
  displayStyle: DisplayStyle;
  defaultTemplateCurrency: CurrencyCode;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  effectiveDate?: string;
  status: string;
  notes?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  CAD: 'C$',
  USD: 'US$',
  INR: '₹',
  GBP: '£',
  AUD: 'A$',
  EUR: '€',
};

const CURRENCY_LOCALES: Record<string, string> = {
  CAD: 'en-CA',
  USD: 'en-US',
  INR: 'en-IN',
  GBP: 'en-GB',
  AUD: 'en-AU',
  EUR: 'de-DE',
};

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; name: string; symbol: string }[] = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'USD', name: 'US Dollar', symbol: 'US$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'per_filing', label: 'Per Filing' },
  { value: 'custom', label: 'Custom' },
];

export const COUNTRIES = [
  'Canada', 'India', 'USA', 'UK', 'Australia', 'Other'
];

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] || code;
}

export function getCurrencyLocale(code: string): string {
  return CURRENCY_LOCALES[code] || 'en-US';
}

/**
 * Format a currency amount based on the display style.
 * Replaces all hardcoded formatCurrency() functions in the codebase.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string = 'CAD',
  displayStyle: DisplayStyle = 'code'
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return `${currencyCode} 0.00`;

  const locale = getCurrencyLocale(currencyCode);
  
  // Format the number with proper locale
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  const symbol = getCurrencySymbol(currencyCode);

  switch (displayStyle) {
    case 'symbol':
      return `${symbol}${formatted}`;
    case 'code':
      return `${currencyCode} ${formatted}`;
    case 'both':
      return `${symbol}${formatted} ${currencyCode}`;
    default:
      return `${currencyCode} ${formatted}`;
  }
}

/**
 * Convert an amount from one currency to another using exchange rates.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRate[]
): { convertedAmount: number; rate: number; found: boolean } {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, rate: 1, found: true };
  }

  // Find direct rate
  const directRate = rates.find(
    r => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency && r.status === 'active'
  );
  if (directRate) {
    return {
      convertedAmount: amount * directRate.exchangeRate,
      rate: directRate.exchangeRate,
      found: true,
    };
  }

  // Find inverse rate
  const inverseRate = rates.find(
    r => r.fromCurrency === toCurrency && r.toCurrency === fromCurrency && r.status === 'active'
  );
  if (inverseRate && inverseRate.exchangeRate !== 0) {
    const rate = 1 / inverseRate.exchangeRate;
    return {
      convertedAmount: amount * rate,
      rate,
      found: true,
    };
  }

  // No rate found
  return { convertedAmount: amount, rate: 0, found: false };
}

/**
 * Default currency settings fallback
 */
export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  baseCurrency: 'CAD',
  displayStyle: 'code',
  defaultTemplateCurrency: 'CAD',
};
