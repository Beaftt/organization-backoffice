import type { FinanceRecurring } from '@/lib/api/finance';

const getMonthPeriodEnd = (selectedYear: number, selectedMonth: number) =>
  `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(
    new Date(selectedYear, selectedMonth + 1, 0).getDate(),
  ).padStart(2, '0')}`;

export const isFinanceRecurringCompletedForMonth = (
  recurring: FinanceRecurring,
  selectedYear: number,
  selectedMonth: number,
) => recurring.nextDue > getMonthPeriodEnd(selectedYear, selectedMonth);

export const isFinanceRecurringToggleDisabled = (
  recurring: FinanceRecurring,
) => !recurring.active || recurring.installmentTotal !== null;