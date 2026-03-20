'use client';

import Link from 'next/link';
import type { MiniCalendarState } from '../types';

type Props = {
  calendar: MiniCalendarState;
  weekdays: string[];
  labels: {
    section: string;
    open: string;
  };
};

export function MiniCalendarWidget({ calendar, weekdays, labels }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]/45">
          {labels.section}
        </p>
        <Link href="/calendar" className="text-[11px] font-semibold text-[var(--sidebar)]">
          {labels.open} →
        </Link>
      </div>
      <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">{calendar.monthLabel}</p>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {weekdays.map((day) => (
          <span key={day} className="text-[10px] font-semibold text-[var(--foreground)]/45">
            {day}
          </span>
        ))}
        {calendar.slots.map((day, index) => (
          <span
            key={`${day ?? 'empty'}-${index}`}
            className={`flex h-8 items-center justify-center rounded-full text-[11px] font-medium ${
              day === calendar.today
                ? 'bg-[var(--sidebar)] text-white'
                : 'text-[var(--foreground)]/70'
            } ${day ? '' : 'opacity-0'}`}
          >
            {day ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
}
