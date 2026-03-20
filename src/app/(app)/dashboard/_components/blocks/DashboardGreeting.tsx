'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import type { UpcomingEvent } from '../../types';

interface DashboardGreetingProps {
  upcomingEvents: UpcomingEvent[];
}

export function DashboardGreeting({ upcomingEvents }: DashboardGreetingProps) {
  const { t, language } = useLanguage();

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.dashboard.greetingMorning
      : hour < 18
        ? t.dashboard.greetingAfternoon
        : t.dashboard.greetingEvening;

  const reminderCount = upcomingEvents.filter((e) => e.type === 'reminder').length;
  const nextCalEvent = upcomingEvents.find((e) => e.type === 'calendar');

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [language],
  );

  return (
    <div className="flex flex-col gap-1">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{greeting} 👋</h1>
        <p className="mt-0.5 text-sm text-[var(--foreground)]/50">{dateLabel}</p>
      </div>

      {(reminderCount > 0 || nextCalEvent) && (
        <div className="mt-1 flex flex-wrap gap-2">
          {reminderCount > 0 && (
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]/70">
              {reminderCount} {t.dashboard.greetingRemindersToday}
            </span>
          )}
          {nextCalEvent && (
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]/70">
              {t.dashboard.greetingNextEvent}: {nextCalEvent.time}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
