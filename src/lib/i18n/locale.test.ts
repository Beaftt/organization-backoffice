import { describe, expect, it } from 'vitest';

import {
  formatCurrencyForLanguage,
  formatMonthLabelForLanguage,
  getLocaleForLanguage,
} from '@/lib/i18n/locale';

describe('i18n locale helpers', () => {
  it('returns the correct locale for each supported language', () => {
    expect(getLocaleForLanguage('pt')).toBe('pt-BR');
    expect(getLocaleForLanguage('en')).toBe('en-US');
  });

  it('formats finance month labels with the active language locale', () => {
    const date = new Date(2026, 3, 1);

    expect(formatMonthLabelForLanguage('pt', date)).toBe('abril de 2026');
    expect(formatMonthLabelForLanguage('en', date)).toBe('April 2026');
  });

  it('formats currency values with the active language locale', () => {
    expect(formatCurrencyForLanguage('pt', 258.27, 'BRL')).toBe('R$ 258,27');
    expect(formatCurrencyForLanguage('en', 258.27, 'BRL')).toBe('R$258.27');
  });
});