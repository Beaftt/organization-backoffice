import type { Language } from '@/lib/i18n/dictionaries';
import { formatCurrency } from '@/lib/utils/currency';

export function getLocaleForLanguage(language: Language): string {
  return language === 'pt' ? 'pt-BR' : 'en-US';
}

export function formatCurrencyForLanguage(
  language: Language,
  value: number,
  currency = 'BRL',
): string {
  return formatCurrency(value, currency, getLocaleForLanguage(language));
}

export function formatMonthLabelForLanguage(language: Language, date: Date): string {
  return new Intl.DateTimeFormat(getLocaleForLanguage(language), {
    month: 'long',
    year: 'numeric',
  }).format(date);
}