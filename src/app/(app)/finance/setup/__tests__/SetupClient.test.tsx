import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SetupClient } from '@/app/(app)/finance/setup/SetupClient';

const mockLanguage = { current: 'pt' as 'pt' | 'en' };

vi.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    t: {},
    language: mockLanguage.current,
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@/components/finance/setup/useFinanceSetupState', () => ({
  useFinanceSetupState: () => ({ mocked: true }),
}));

vi.mock('@/components/finance/setup/FinanceSetupSurface', () => ({
  FinanceSetupSurface: ({ monthLabel }: { monthLabel: string }) => <div>{monthLabel}</div>,
}));

describe('SetupClient', () => {
  it('mounts the real setup surface with the current route month', () => {
    mockLanguage.current = 'pt';

    render(
      <SetupClient
        initialRouteState={{
          query: '',
          group: 'all',
          type: 'all',
          status: 'all',
          sort: 'date',
          page: 1,
          month: { year: 2026, month: 3 },
          tab: 'accounts',
        }}
      />,
    );

    expect(screen.getByText('março de 2026')).toBeInTheDocument();
  });

  it('formats the setup month with the active language locale', () => {
    mockLanguage.current = 'en';

    render(
      <SetupClient
        initialRouteState={{
          query: '',
          group: 'all',
          type: 'all',
          status: 'all',
          sort: 'date',
          page: 1,
          month: { year: 2026, month: 3 },
          tab: 'accounts',
        }}
      />,
    );

    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });
});