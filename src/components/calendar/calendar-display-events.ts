import type { Language } from '@/lib/i18n/dictionaries';
import { getLocaleForLanguage } from '@/lib/i18n/locale';
import type { CalendarEvent } from '@/lib/api/calendar';
import type { FinanceRecurring } from '@/lib/api/finance';
import {
  getSubscriptionOccurrencesForMonth,
  isSubscriptionRecurring,
} from '@/lib/finance/finance-recurring-insights';

import type { CalendarDisplayEvent } from './types';

type SubscriptionDisplayOptions = {
  language: Language;
  badgeLabel: string;
  descriptionLabel: string;
};

const sortByStartAt = (
  left: Pick<CalendarEvent, 'startAt' | 'title'>,
  right: Pick<CalendarEvent, 'startAt' | 'title'>,
) => {
  if (left.startAt === right.startAt) {
    return left.title.localeCompare(right.title);
  }

  return left.startAt.localeCompare(right.startAt);
};

const toMiddayIso = (date: string) => `${date}T12:00:00.000Z`;

const formatCurrency = (value: number, currency: string, language: Language) =>
  new Intl.NumberFormat(getLocaleForLanguage(language), {
    style: 'currency',
    currency,
  }).format(value);

const getMonthKeysBetween = (fromDate: string, toDate: string) => {
  const [fromYear, fromMonth] = fromDate.split('-').map(Number);
  const [toYear, toMonth] = toDate.split('-').map(Number);
  const cursor = new Date(Date.UTC(fromYear, fromMonth - 1, 1));
  const end = new Date(Date.UTC(toYear, toMonth - 1, 1));
  const months: Array<{ year: number; month: number }> = [];

  while (cursor <= end) {
    months.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth(),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
};

export function toCalendarDisplayEvents(events: CalendarEvent[]): CalendarDisplayEvent[] {
  return [...events]
    .map((event) => ({ ...event, source: 'calendar' as const }))
    .sort(sortByStartAt);
}

export function buildFinanceSubscriptionDisplayEvents(
  recurringItems: FinanceRecurring[],
  fromDate: string,
  toDate: string,
  options: SubscriptionDisplayOptions,
): CalendarDisplayEvent[] {
  const months = getMonthKeysBetween(fromDate, toDate);

  return recurringItems
    .filter((recurring) => isSubscriptionRecurring(recurring) && recurring.active)
    .flatMap((recurring) =>
      months.flatMap(({ year, month }) =>
        getSubscriptionOccurrencesForMonth(recurring, year, month)
          .filter((occurrence) => occurrence.date >= fromDate && occurrence.date <= toDate)
          .map((occurrence) => ({
            id: `finance-subscription-${recurring.id}-${occurrence.date}`,
            workspaceId: recurring.workspaceId,
            ownerUserId: 'finance-subscription',
            title: recurring.title,
            description:
              `${options.descriptionLabel} · ` +
              formatCurrency(recurring.amount, recurring.currency, options.language),
            startAt: toMiddayIso(occurrence.date),
            endAt: null,
            allDay: true,
            tags: null,
            participantIds: null,
            documentIds: null,
            minutesText: null,
            minutesDocumentIds: null,
            recurrence: {
              frequency: recurring.frequency,
              interval: recurring.interval,
            },
            createdAt: recurring.createdAt,
            updatedAt: recurring.updatedAt,
            source: 'finance-subscription' as const,
            readOnly: true,
            recurringId: recurring.id,
            sourceLabel: options.badgeLabel,
          })),
      ),
    )
    .sort(sortByStartAt);
}

export function mergeCalendarDisplayEvents(
  calendarEvents: CalendarEvent[],
  subscriptionEvents: CalendarDisplayEvent[],
): CalendarDisplayEvent[] {
  return [...toCalendarDisplayEvents(calendarEvents), ...subscriptionEvents].sort(
    sortByStartAt,
  );
}
