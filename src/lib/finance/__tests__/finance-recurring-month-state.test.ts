import { describe, expect, it } from 'vitest';

import { sampleRecurring } from '@/components/finance/setup/__tests__/finance-test-data';
import {
  isFinanceRecurringCompletedForMonth,
  isFinanceRecurringToggleDisabled,
} from '@/lib/finance/finance-recurring-month-state';

describe('finance-recurring-month-state', () => {
  it('marks a recurring rule as completed when the next due is after the selected month', () => {
    expect(
      isFinanceRecurringCompletedForMonth(
        { ...sampleRecurring, nextDue: '2026-04-10' },
        2026,
        2,
      ),
    ).toBe(true);

    expect(
      isFinanceRecurringCompletedForMonth(
        { ...sampleRecurring, nextDue: '2026-03-10' },
        2026,
        2,
      ),
    ).toBe(false);
  });

  it('disables the recurring toggle for paused or installment-based rules', () => {
    expect(
      isFinanceRecurringToggleDisabled({
        ...sampleRecurring,
        active: false,
      }),
    ).toBe(true);

    expect(
      isFinanceRecurringToggleDisabled({
        ...sampleRecurring,
        installmentTotal: 6,
      }),
    ).toBe(true);

    expect(isFinanceRecurringToggleDisabled(sampleRecurring)).toBe(false);
  });
});