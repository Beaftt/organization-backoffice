import { describe, expect, it } from 'vitest';

import type { FinanceRecurring } from '@/lib/api/finance';
import {
  buildRecurringProjectionSummary,
  getSubscriptionOccurrencesForMonth,
  isSubscriptionRecurring,
} from '@/lib/finance/finance-recurring-insights';

const makeRecurring = (overrides: Partial<FinanceRecurring> = {}): FinanceRecurring => ({
  id: overrides.id ?? 'rec-1',
  workspaceId: 'ws-1',
  title: overrides.title ?? 'Netflix',
  amount: overrides.amount ?? 39.9,
  currency: overrides.currency ?? 'BRL',
  group: overrides.group ?? 'EXPENSE',
  frequency: overrides.frequency ?? 'MONTHLY',
  interval: overrides.interval ?? 1,
  nextDue: overrides.nextDue ?? '2026-04-07',
  endDate: overrides.endDate ?? null,
  active: overrides.active ?? true,
  isSubscription: overrides.isSubscription ?? true,
  accountId: overrides.accountId ?? 'acc-1',
  paymentMethodId: overrides.paymentMethodId ?? 'pm-1',
  categoryId: overrides.categoryId ?? null,
  tagIds: overrides.tagIds ?? null,
  createdAt: overrides.createdAt ?? '2026-01-07T00:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-01-07T00:00:00.000Z',
  installmentTotal: overrides.installmentTotal ?? null,
});

describe('finance-recurring-insights', () => {
  it('recognizes only infinite subscription recurring items as subscriptions', () => {
    expect(isSubscriptionRecurring(makeRecurring())).toBe(true);
    expect(isSubscriptionRecurring(makeRecurring({ isSubscription: false }))).toBe(false);
    expect(isSubscriptionRecurring(makeRecurring({ installmentTotal: 6 }))).toBe(false);
  });

  it('builds month occurrences for a subscription recurring item', () => {
    const occurrences = getSubscriptionOccurrencesForMonth(makeRecurring(), 2026, 3);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]).toMatchObject({
      date: '2026-04-07',
      day: 7,
    });
  });

  it('builds a recurring projection summary using active non-installment items only', () => {
    const summary = buildRecurringProjectionSummary(
      [
        makeRecurring({ id: 'rec-1', amount: 39.9 }),
        makeRecurring({ id: 'rec-2', title: 'Aluguel', amount: 1200, isSubscription: false, nextDue: '2026-04-10' }),
        makeRecurring({ id: 'rec-3', active: false, amount: 200 }),
        makeRecurring({ id: 'rec-4', installmentTotal: 10, amount: 150 }),
      ],
      [],
      2026,
      3,
    );

    expect(summary.activeCount).toBe(2);
    expect(summary.monthTotal).toBeCloseTo(1239.9);
    expect(summary.annualForecast).toBeGreaterThan(summary.monthTotal);
  });
});
