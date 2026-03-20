'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { DayCell } from './DayCell';
import type { CalendarCellDate, CalendarEvent } from '../types';

interface MonthViewProps {
  monthDate: Date;
  todayKey: string;
  eventsByDay: Record<string, CalendarEvent[]>;
  onAddEvent: (dateKey: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function MonthView({ monthDate, todayKey, eventsByDay, onAddEvent, onSelectEvent }: MonthViewProps) {
  const { t } = useLanguage();

  const cells = useMemo((): CalendarCellDate[] => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();
    const result: CalendarCellDate[] = [];

    // Prev-month trailing days (fill first row)
    for (let i = startWeekday - 1; i >= 0; i--) {
      const date = new Date(year, month, -i); // day 0 = last of prev month, day -1 = second to last
      result.push({ date, dayNumber: date.getDate(), dateKey: toKey(date), isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      result.push({ date, dayNumber: d, dateKey: toKey(date), isCurrentMonth: true });
    }

    // Next-month leading days (complete last row)
    const trailing = (7 - (result.length % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      const date = new Date(year, month + 1, i);
      result.push({ date, dayNumber: i, dateKey: toKey(date), isCurrentMonth: false });
    }

    return result;
  }, [monthDate]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-[var(--border)]">
          {t.calendar.days.map((day) => (
            <div
              key={day}
              className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Cell grid — divided by thin lines */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border)]">
          {cells.map((cell) => (
            <DayCell
              key={cell.dateKey}
              cellDate={cell}
              events={eventsByDay[cell.dateKey] ?? []}
              isToday={cell.dateKey === todayKey}
              onAddEvent={onAddEvent}
              onSelectEvent={onSelectEvent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
