'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { CalendarRecurrence } from '@/lib/api/calendar';

type FrequencyValue = CalendarRecurrence['frequency'] | 'SEMIANNUAL';

interface RecurrencePillsProps {
  value: FrequencyValue | null;
  onChange: (v: FrequencyValue | null) => void;
}

export function RecurrencePills({ value, onChange }: RecurrencePillsProps) {
  const { t } = useLanguage();

  const options: Array<{ value: FrequencyValue; label: string }> = [
    { value: 'DAILY',      label: t.calendar.recurrenceDaily },
    { value: 'WEEKLY',     label: t.calendar.recurrenceWeekly },
    { value: 'MONTHLY',    label: t.calendar.recurrenceMonthly },
    { value: 'SEMIANNUAL', label: t.calendar.recurrenceSemiannual },
    { value: 'YEARLY',     label: t.calendar.recurrenceYearly },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? null : opt.value)}
          className={[
            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
            value === opt.value
              ? 'border-[var(--sidebar)]/30 bg-[var(--sidebar)]/10 text-[var(--sidebar)]'
              : 'border-[var(--border)] bg-transparent text-[var(--foreground)]/60 hover:border-[var(--foreground)]/30',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
