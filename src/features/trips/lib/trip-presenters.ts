import { Language } from '@/shared/i18n/language-context';

function getLocale(language: Language) {
  return language === 'vi' ? 'vi-VN' : 'en-US';
}

export function formatTripDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatTripDateRange(
  startDate: string,
  endDate: string,
  language: Language,
) {
  return `${formatTripDate(startDate, language)} - ${formatTripDate(endDate, language)}`;
}

export function formatTripBudget(
  amount: number,
  currency: string,
  language: Language,
) {
  try {
    return new Intl.NumberFormat(getLocale(language), {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(getLocale(language))} ${currency}`;
  }
}
