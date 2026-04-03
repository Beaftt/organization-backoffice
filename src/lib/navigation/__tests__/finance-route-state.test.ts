import {
  buildFinanceHref,
  createDefaultFinanceRouteState,
  formatFinanceMonthParam,
  getAllowedFinanceTabs,
  parseFinanceRouteState,
} from '@/lib/navigation/finance-route-state';

describe('finance-route-state', () => {
  it('parses route defaults when search params are empty', () => {
    const state = parseFinanceRouteState(new URLSearchParams(), 'desk');

    expect(state.query).toBe('');
    expect(state.group).toBe('all');
    expect(state.tab).toBe('overview');
    expect(formatFinanceMonthParam(state.month.year, state.month.month)).toMatch(
      /^\d{4}-\d{2}$/,
    );
  });

  it('normalizes tabs by surface when parsing route state', () => {
    const state = parseFinanceRouteState(
      new URLSearchParams('tab=paymentMethods&month=2026-04&page=2'),
      'desk',
    );

    expect(state.tab).toBe('overview');
    expect(state.page).toBe(2);
    expect(state.month).toEqual({ year: 2026, month: 3 });
  });

  it('builds hrefs with preserved month and scoped tabs', () => {
    const href = buildFinanceHref('setup', {
      ...createDefaultFinanceRouteState('setup'),
      accountId: 'acc-1',
      cardId: 'card-1',
      month: { year: 2026, month: 3 },
      route: 'credit',
      tab: 'paymentMethods',
      query: 'mercado',
    });

    expect(href).toBe(
      '/finance/setup?month=2026-04&account=acc-1&card=card-1&q=mercado&route=credit&tab=paymentMethods',
    );
  });

  it('parses the core operational filters from the route state', () => {
    const state = parseFinanceRouteState(
      new URLSearchParams('account=acc-1&card=card-1&route=credit&month=2026-04'),
      'desk',
    );

    expect(state.accountId).toBe('acc-1');
    expect(state.cardId).toBe('card-1');
    expect(state.route).toBe('credit');
  });

  it('exposes allowed tabs by compatibility surface', () => {
    expect(getAllowedFinanceTabs('desk')).toEqual(['overview', 'entries']);
    expect(getAllowedFinanceTabs('setup')).toEqual(['accounts', 'paymentMethods']);
    expect(getAllowedFinanceTabs('legacy')).toEqual([
      'overview',
      'entries',
      'accounts',
      'paymentMethods',
    ]);
  });
});