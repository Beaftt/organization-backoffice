'use client';

import { useLanguage } from '@/lib/i18n/language-context';

interface YearViewProps {
  yearMonths: Date[];
  eventsByMonth: Map<number, number>;
  formatMonthLabel: (d: Date) => string;
  onMonthSelect: (month: Date) => void;
}

export function YearView({ yearMonths, eventsByMonth, formatMonthLabel, onMonthSelect }: YearViewProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {yearMonths.map((month) => {
        const count = eventsByMonth.get(month.getMonth()) ?? 0;
        return (
          <button
            key={month.toISOString()}
            type="button"
            onClick={() => onMonthSelect(month)}
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-muted)] transition"
          >
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {formatMonthLabel(month)}
            </span>
            <span className="text-xs text-[var(--foreground)]/40">
              {t.calendar.eventsCount.replace('{count}', String(count))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
