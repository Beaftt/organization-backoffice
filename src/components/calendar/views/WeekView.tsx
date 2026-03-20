'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { EventChip } from './EventChip';
import type { CalendarEvent } from '../types';

interface WeekViewProps {
  weekDays: Array<{ key: string; label: string; day: number }>;
  todayKey: string;
  eventsByDay: Record<string, CalendarEvent[]>;
  onAddEvent: (dateKey: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export function WeekView({ weekDays, todayKey, eventsByDay, onAddEvent, onSelectEvent }: WeekViewProps) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto p-4">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayEvents = eventsByDay[day.key] ?? [];
            const isToday = day.key === todayKey;
            return (
              <div
                key={day.key}
                className={[
                  'flex flex-col min-h-[160px] rounded-2xl border p-2 transition-colors',
                  isToday
                    ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/5'
                    : 'border-[var(--border)] bg-[var(--surface)]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-[var(--foreground)]/40">{day.label}</span>
                    <span
                      className={[
                        'text-sm font-bold',
                        isToday ? 'text-[var(--sidebar)]' : 'text-[var(--foreground)]',
                      ].join(' ')}
                    >
                      {day.day}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddEvent(day.key)}
                    className="text-xs text-[var(--foreground)]/30 hover:text-[var(--sidebar)] transition-colors"
                    aria-label={t.calendar.addEvent}
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {dayEvents.map((event) => (
                    <EventChip
                      key={`${event.id}-${event.startAt}`}
                      event={event}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
