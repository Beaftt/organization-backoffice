import type { FinanceRecurring, FinanceTransaction } from '@/lib/api/finance';

export type SubscriptionOccurrence = {
  recurring: FinanceRecurring;
  date: string;
  day: number;
};

export type RecurringProjectionSummary = {
  activeCount: number;
  monthTotal: number;
  monthlyEstimate: number;
  annualForecast: number;
  averageMonthlyCost: number;
  yearOverYearChange: number | null;
};

const MAX_OCCURRENCE_STEPS = 480;
const MAX_MONTH_SUMMARY_STEPS = 120;

const toUtcDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

const shiftDate = (
  value: Date,
  frequency: FinanceRecurring['frequency'],
  interval: number,
) => {
  const next = new Date(value.getTime());

  if (frequency === 'DAILY') {
    next.setUTCDate(next.getUTCDate() + interval);
  }

  if (frequency === 'WEEKLY') {
    next.setUTCDate(next.getUTCDate() + interval * 7);
  }

  if (frequency === 'MONTHLY') {
    next.setUTCMonth(next.getUTCMonth() + interval);
  }

  if (frequency === 'YEARLY') {
    next.setUTCFullYear(next.getUTCFullYear() + interval);
  }

  return next;
};

const resolveInterval = (recurring: Pick<FinanceRecurring, 'interval'>) =>
  Math.max(1, recurring.interval ?? 1);

const getMonthWindow = (year: number, month: number) => ({
  start: new Date(Date.UTC(year, month, 1)),
  end: new Date(Date.UTC(year, month + 1, 0)),
});

const incrementMonth = (year: number, month: number, offset = 1) => {
  const next = new Date(Date.UTC(year, month + offset, 1));

  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth(),
  };
};

const isSameMonth = (value: string, year: number, month: number) => {
  const date = toUtcDate(value);

  return date.getUTCFullYear() === year && date.getUTCMonth() === month;
};

const normalizeMonthlyAmount = (recurring: FinanceRecurring) => {
  const interval = resolveInterval(recurring);

  if (recurring.frequency === 'DAILY') {
    return recurring.amount * (30 / interval);
  }

  if (recurring.frequency === 'WEEKLY') {
    return recurring.amount * ((52 / 12) / interval);
  }

  if (recurring.frequency === 'YEARLY') {
    return recurring.amount / (12 * interval);
  }

  return recurring.amount / interval;
};

const isProjectedRecurring = (recurring: FinanceRecurring) =>
  recurring.active && recurring.installmentTotal === null;

const getPaidTotalByRecurringForMonth = (
  transactions: FinanceTransaction[],
  recurringId: string,
  year: number,
  month: number,
) =>
  transactions
    .filter(
      (transaction) =>
        transaction.recurringId === recurringId &&
        transaction.status === 'PAID' &&
        isSameMonth(transaction.occurredAt, year, month),
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

function getProjectedRecurringOccurrencesForMonth(
  recurring: FinanceRecurring,
  year: number,
  month: number,
): SubscriptionOccurrence[] {
  if (!isProjectedRecurring(recurring)) {
    return [];
  }

  const { start, end } = getMonthWindow(year, month);
  const createdAt = toUtcDate(recurring.createdAt);
  const endDate = recurring.endDate ? toUtcDate(recurring.endDate) : null;
  const interval = resolveInterval(recurring);
  let cursor = toUtcDate(recurring.nextDue);
  let steps = 0;

  while (cursor > end && steps < MAX_OCCURRENCE_STEPS) {
    const previous = shiftDate(cursor, recurring.frequency, -interval);

    if (previous < createdAt) {
      break;
    }

    cursor = previous;
    steps += 1;
  }

  while (cursor < start && steps < MAX_OCCURRENCE_STEPS) {
    const next = shiftDate(cursor, recurring.frequency, interval);

    if (next.getTime() === cursor.getTime()) {
      break;
    }

    cursor = next;
    steps += 1;
  }

  const occurrences: SubscriptionOccurrence[] = [];

  while (cursor <= end && steps < MAX_OCCURRENCE_STEPS) {
    if (cursor >= start && cursor >= createdAt && (!endDate || cursor <= endDate)) {
      occurrences.push({
        recurring,
        date: toIsoDate(cursor),
        day: cursor.getUTCDate(),
      });
    }

    const next = shiftDate(cursor, recurring.frequency, interval);

    if (next.getTime() === cursor.getTime()) {
      break;
    }

    cursor = next;
    steps += 1;
  }

  return occurrences;
}

export function isSubscriptionRecurring(recurring: FinanceRecurring) {
  return recurring.isSubscription === true && recurring.installmentTotal === null;
}

export function getSubscriptionOccurrencesForMonth(
  recurring: FinanceRecurring,
  year: number,
  month: number,
): SubscriptionOccurrence[] {
  if (!isSubscriptionRecurring(recurring)) {
    return [];
  }

  return getProjectedRecurringOccurrencesForMonth(recurring, year, month);
}

const getMonthTotalFromHistoryOrEstimate = (
  recurringItems: FinanceRecurring[],
  transactions: FinanceTransaction[],
  year: number,
  month: number,
) => {
  const visibleRecurring = recurringItems.filter(
    (recurring) => getProjectedRecurringOccurrencesForMonth(recurring, year, month).length > 0,
  );

  return visibleRecurring.reduce((sum, recurring) => {
    const paidTotal = getPaidTotalByRecurringForMonth(
      transactions,
      recurring.id,
      year,
      month,
    );

    if (paidTotal > 0) {
      return sum + paidTotal;
    }

    return (
      sum +
      getProjectedRecurringOccurrencesForMonth(recurring, year, month).length * recurring.amount
    );
  }, 0);
};

export function buildRecurringProjectionSummary(
  recurringItems: FinanceRecurring[],
  transactions: FinanceTransaction[],
  year: number,
  month: number,
): RecurringProjectionSummary {
  const activeRecurring = recurringItems.filter((recurring) => isProjectedRecurring(recurring));
  const monthOccurrences = activeRecurring.flatMap((recurring) =>
    getProjectedRecurringOccurrencesForMonth(recurring, year, month),
  );
  const monthTotal = monthOccurrences.reduce(
    (sum, occurrence) => sum + occurrence.recurring.amount,
    0,
  );
  const monthlyEstimate = activeRecurring.reduce(
    (sum, recurring) => sum + normalizeMonthlyAmount(recurring),
    0,
  );
  const rollingMonths: number[] = [];

  for (let index = 0; index < 6; index += 1) {
    const target = incrementMonth(year, month, -index);
    rollingMonths.push(
      getMonthTotalFromHistoryOrEstimate(
        activeRecurring,
        transactions,
        target.year,
        target.month,
      ),
    );
  }

  const previousYearTotal = getMonthTotalFromHistoryOrEstimate(
    activeRecurring,
    transactions,
    year - 1,
    month,
  );

  return {
    activeCount: activeRecurring.length,
    monthTotal,
    monthlyEstimate,
    annualForecast: monthlyEstimate * 12,
    averageMonthlyCost:
      rollingMonths.length > 0
        ? rollingMonths.reduce((sum, value) => sum + value, 0) / rollingMonths.length
        : 0,
    yearOverYearChange:
      previousYearTotal > 0 ? (monthTotal - previousYearTotal) / previousYearTotal : null,
  };
}
