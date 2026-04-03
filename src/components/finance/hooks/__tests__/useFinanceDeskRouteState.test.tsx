import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFinanceDeskRouteState } from '@/components/finance/hooks/useFinanceDeskRouteState';
import type { FinanceRouteState } from '@/lib/navigation/finance-route-state';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  pathname: '/finance/desk',
  searchParams: new URLSearchParams('month=2026-04'),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.searchParams,
}));

const initialRouteState: FinanceRouteState = {
  accountId: 'all',
  cardId: 'all',
  query: '',
  group: 'all',
  route: 'all',
  type: 'all',
  status: 'all',
  sort: 'date',
  page: 1,
  month: { year: 2026, month: 3 },
  tab: 'overview',
};

describe('useFinanceDeskRouteState', () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.pathname = '/finance/desk';
    mocks.searchParams = new URLSearchParams('month=2026-04');
    window.sessionStorage.clear();
  });

  it('does not replace when the current href already matches the serialized desk state', () => {
    renderHook(() => useFinanceDeskRouteState({ initialRouteState }));

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('replaces when the current href differs from the serialized desk state', () => {
    mocks.searchParams = new URLSearchParams('month=2026-03');

    renderHook(() => useFinanceDeskRouteState({ initialRouteState }));

    expect(mocks.replace).toHaveBeenCalledWith('/finance/desk?month=2026-04');
  });
});