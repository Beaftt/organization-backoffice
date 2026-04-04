import {
  applyFinanceComposerRouteState,
  buildFinanceDeskHref,
  parseFinanceComposerRouteState,
} from '@/lib/navigation/finance-composer-route-state';
import { createDefaultFinanceRouteState } from '@/lib/navigation/finance-route-state';

describe('finance-composer-route-state', () => {
  it('parses the composer route when a create flow is open', () => {
    const state = parseFinanceComposerRouteState(
      new URLSearchParams('composer=create&composerIntent=credit&composerStep=2'),
    );

    expect(state).toEqual({
      mode: 'create',
      intent: 'credit',
      step: 2,
      transactionId: null,
    });
  });

  it('returns null when the composer mode is missing or invalid', () => {
    expect(parseFinanceComposerRouteState(new URLSearchParams())).toBeNull();
    expect(
      parseFinanceComposerRouteState(new URLSearchParams('composer=drawer')),
    ).toBeNull();
  });

  it('removes composer params when the modal closes', () => {
    const params = new URLSearchParams(
      'month=2026-04&composer=edit&composerIntent=credit&composerStep=3&composerTx=tx-1',
    );

    applyFinanceComposerRouteState(params, null);

    expect(params.toString()).toBe('month=2026-04');
  });

  it('builds a desk href with route filters and composer state', () => {
    const href = buildFinanceDeskHref(
      {
        ...createDefaultFinanceRouteState('desk'),
        month: { year: 2026, month: 3 },
        query: 'mercado',
      },
      {
        mode: 'create',
        intent: 'transfer',
        step: 2,
        transactionId: null,
      },
    );

    expect(href).toBe(
      '/finance/desk?month=2026-04&q=mercado&composer=create&composerIntent=transfer&composerStep=2',
    );
  });
});