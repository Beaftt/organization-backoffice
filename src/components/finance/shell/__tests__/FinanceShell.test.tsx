import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FinanceShell } from '@/components/finance/shell/FinanceShell';

const mockLanguage = { current: 'pt' as 'pt' | 'en' };

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {},
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/finance/setup',
  useSearchParams: () => new URLSearchParams('month=2026-04&q=mercado&tab=paymentMethods'),
}));

describe('FinanceShell', () => {
  it('renders localized finance surface links and preserves shared route params', () => {
    mockLanguage.current = 'pt';

    render(
      <FinanceShell>
        <div>content</div>
      </FinanceShell>,
    );

    expect(screen.getByRole('link', { name: 'Painel' })).toHaveAttribute(
      'href',
      '/finance/desk?month=2026-04&q=mercado',
    );
    expect(screen.getByRole('link', { name: 'Análises' })).toHaveAttribute(
      'href',
      '/finance/insights?month=2026-04&q=mercado',
    );
    expect(screen.getByRole('link', { name: 'Ajustes' })).toHaveAttribute(
      'href',
      '/finance/setup?month=2026-04&q=mercado&tab=paymentMethods',
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders English surface labels when language changes', () => {
    mockLanguage.current = 'en';

    render(
      <FinanceShell>
        <div>content</div>
      </FinanceShell>,
    );

    expect(screen.getByRole('link', { name: 'Desk' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Setup' })).toBeInTheDocument();
  });
});