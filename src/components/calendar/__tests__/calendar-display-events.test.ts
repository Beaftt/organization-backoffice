import { describe, expect, it } from 'vitest';

import type { CalendarEvent } from '@/lib/api/calendar';
import type { FinanceRecurring } from '@/lib/api/finance';

import {
  buildFinanceSubscriptionDisplayEvents,
  mergeCalendarDisplayEvents,
} from '@/components/calendar/calendar-display-events';

const makeRecurring = (
  overrides: Partial<FinanceRecurring> = {},
): FinanceRecurring => ({
  id: overrides.id ?? 'rec-1',
  workspaceId: 'ws-1',
  title: overrides.title ?? 'GitHub',
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

const makeCalendarEvent = (
  overrides: Partial<CalendarEvent> = {},
): CalendarEvent => ({
  id: overrides.id ?? 'event-1',
  workspaceId: overrides.workspaceId ?? 'ws-1',
  ownerUserId: overrides.ownerUserId ?? 'user-1',
  title: overrides.title ?? 'Doctor',
  description: overrides.description ?? null,
  startAt: overrides.startAt ?? '2026-04-10T10:00:00.000Z',
  endAt: overrides.endAt ?? '2026-04-10T11:00:00.000Z',
  allDay: overrides.allDay ?? false,
  tags: overrides.tags ?? null,
  participantIds: overrides.participantIds ?? null,
  documentIds: overrides.documentIds ?? null,
  minutesText: overrides.minutesText ?? null,
  minutesDocumentIds: overrides.minutesDocumentIds ?? null,
  recurrence: overrides.recurrence ?? null,
  createdAt: overrides.createdAt ?? '2026-04-01T00:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-04-01T00:00:00.000Z',
});

describe('calendar-display-events', () => {
  it('builds read-only calendar entries from finance subscriptions', () => {
    const events = buildFinanceSubscriptionDisplayEvents(
      [makeRecurring()],
      '2026-04-01',
      '2026-04-30',
      {
        language: 'pt',
        badgeLabel: 'Assinatura',
        descriptionLabel: 'Assinatura do Financeiro',
      },
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: 'finance-subscription-rec-1-2026-04-07',
      title: 'GitHub',
      allDay: true,
      source: 'finance-subscription',
      readOnly: true,
      recurringId: 'rec-1',
      sourceLabel: 'Assinatura',
    });
    expect(events[0].description).toContain('Assinatura do Financeiro');
  });

  it('ignores non-subscription and installment recurring items', () => {
    const events = buildFinanceSubscriptionDisplayEvents(
      [
        makeRecurring({ id: 'rec-ok' }),
        makeRecurring({ id: 'rec-off', isSubscription: false }),
        makeRecurring({ id: 'rec-installment', installmentTotal: 6 }),
      ],
      '2026-04-01',
      '2026-04-30',
      {
        language: 'pt',
        badgeLabel: 'Assinatura',
        descriptionLabel: 'Assinatura do Financeiro',
      },
    );

    expect(events).toHaveLength(1);
    expect(events[0]?.recurringId).toBe('rec-ok');
  });

  it('merges calendar events and subscription events in chronological order', () => {
    const merged = mergeCalendarDisplayEvents(
      [makeCalendarEvent()],
      buildFinanceSubscriptionDisplayEvents(
        [makeRecurring({ nextDue: '2026-04-07' })],
        '2026-04-01',
        '2026-04-30',
        {
          language: 'pt',
          badgeLabel: 'Assinatura',
          descriptionLabel: 'Assinatura do Financeiro',
        },
      ),
    );

    expect(merged.map((event) => event.id)).toEqual([
      'finance-subscription-rec-1-2026-04-07',
      'event-1',
    ]);
  });
});