'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { EventChip } from './EventChip';
import type { CalendarCellDate, CalendarDisplayEvent } from '../types';

interface DayCellProps {
  cellDate: CalendarCellDate;
  events: CalendarDisplayEvent[];
  isToday: boolean;
  onAddEvent: (dateKey: string) => void;
  onSelectEvent: (event: CalendarDisplayEvent) => void;
}

export function DayCell({ cellDate, events, isToday, onAddEvent, onSelectEvent }: DayCellProps) {
  const { t } = useLanguage();
  const visible = events.slice(0, 3);
  const overflow = events.length - 3;

  return (
    <div
      className={[
        'relative p-1.5 min-h-[80px] cursor-pointer group transition-colors',
        cellDate.isCurrentMonth
          ? 'bg-[var(--surface)] hover:bg-[var(--surface-muted)]'
          : 'bg-[var(--surface-muted)]/50 hover:bg-[var(--surface-muted)]',
      ].join(' ')}
      onClick={() => onAddEvent(cellDate.dateKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAddEvent(cellDate.dateKey); } }}
    >
      {/* Day number */}
      <div
        className={[
          'w-6 h-6 flex items-center justify-center rounded-full mb-1',
          'text-xs font-medium transition-colors',
          isToday
            ? 'bg-[var(--sidebar)] text-white font-bold'
            : cellDate.isCurrentMonth
              ? 'text-[var(--foreground)]'
              : 'text-[var(--foreground)]/25',
        ].join(' ')}
      >
        {cellDate.dayNumber}
      </div>

      {/* Event chips — never show «Sem eventos» when empty */}
      <div className="flex flex-col gap-0.5">
        {visible.map((event) => (
          <EventChip
            key={`${event.id}-${event.startAt}`}
            event={event}
            onClick={(e) => { e.stopPropagation(); onSelectEvent(event); }}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[10px] text-[var(--foreground)]/40 pl-1">
            +{overflow} {t.calendar.more}
          </span>
        )}
      </div>

      {/* "+" — only visible on hover */}
      <button
        type="button"
        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-transparent text-xs leading-none text-[var(--foreground)]/40 opacity-60 transition-all hover:bg-[var(--sidebar)]/10 hover:text-[var(--sidebar)] hover:opacity-100 group-hover:opacity-100 focus:opacity-100"
        onClick={(e) => { e.stopPropagation(); onAddEvent(cellDate.dateKey); }}
        aria-label={t.calendar.addEvent}
      >
        +
      </button>
    </div>
  );
}
