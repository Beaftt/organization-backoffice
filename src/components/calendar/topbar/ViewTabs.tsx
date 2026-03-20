'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { ViewMode } from '../types';

interface ViewTabsProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewTabs({ current, onChange }: ViewTabsProps) {
  const { t } = useLanguage();

  const tabs: Array<{ value: ViewMode; label: string }> = [
    { value: 'day',   label: t.calendar.viewDayTab },
    { value: 'week',  label: t.calendar.viewWeekTab },
    { value: 'month', label: t.calendar.viewMonthTab },
    { value: 'year',  label: t.calendar.viewYearTab },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={[
            'rounded-lg px-3 py-1 text-xs font-semibold transition-all',
            current === tab.value
              ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
              : 'text-[var(--foreground)]/50 hover:text-[var(--foreground)]',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
