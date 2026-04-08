'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { CalendarDisplayEvent } from '../types';

interface DayViewProps {
  dateLabel: string;
  events: CalendarDisplayEvent[];
  dateKey: string;
  onAddEvent: (dateKey: string) => void;
  onSelectEvent: (event: CalendarDisplayEvent) => void;
  formatTime: (v: string) => string;
}

export function DayView({ dateLabel, events, dateKey, onAddEvent, onSelectEvent, formatTime }: DayViewProps) {
  const { t } = useLanguage();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">{dateLabel}</p>
        <button
          type="button"
          onClick={() => onAddEvent(dateKey)}
          className="rounded-xl bg-[var(--sidebar)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition"
        >
          {t.calendar.openCreate}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {events.length ? (
          events.map((event) => (
            <button
              key={`${event.id}-${event.startAt}`}
              type="button"
              onClick={() => onSelectEvent(event)}
              className="flex flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-left hover:bg-[var(--surface)] transition"
            >
              <span className="text-xs text-[var(--foreground)]/40">
                {event.allDay ? t.calendar.allDayLabel : formatTime(event.startAt)}
              </span>
              {event.sourceLabel ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--sidebar)]">
                  {event.sourceLabel}
                </span>
              ) : null}
              <span className="text-sm font-semibold text-[var(--foreground)]">{event.title}</span>
            </button>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-[var(--foreground)]/40">{t.calendar.dayEmpty}</p>
        )}
      </div>
    </div>
  );
}
