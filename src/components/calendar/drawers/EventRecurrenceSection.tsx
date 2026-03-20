'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { RecurrencePills } from '../shared/RecurrencePills';
import type { EventFormValues, CalendarRecurrence } from '../types';

type Frequency = CalendarRecurrence['frequency'] | 'SEMIANNUAL';

interface EventRecurrenceSectionProps {
  recurrenceEnabled: boolean;
  recurrenceFrequency: Frequency;
  recurrenceInterval: string;
  recurrenceWeekdays: number[];
  recurrenceMonthDays: number[];
  recurrenceUntil: string;
  onChange: (updates: Partial<EventFormValues>) => void;
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function EventRecurrenceSection({
  recurrenceEnabled,
  recurrenceFrequency,
  recurrenceInterval,
  recurrenceWeekdays,
  recurrenceMonthDays,
  recurrenceUntil,
  onChange,
}: EventRecurrenceSectionProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleFrequencyChange = (v: Frequency | null) => {
    if (!v) {
      onChange({ recurrenceEnabled: false });
    } else {
      onChange({ recurrenceEnabled: true, recurrenceFrequency: v });
    }
  };

  const toggleWeekday = (day: number) => {
    const next = recurrenceWeekdays.includes(day)
      ? recurrenceWeekdays.filter((d) => d !== day)
      : [...recurrenceWeekdays, day].sort((a, b) => a - b);
    onChange({ recurrenceWeekdays: next });
  };

  const toggleMonthDay = (day: number) => {
    const next = recurrenceMonthDays.includes(day)
      ? recurrenceMonthDays.filter((d) => d !== day)
      : [...recurrenceMonthDays, day].sort((a, b) => a - b);
    onChange({ recurrenceMonthDays: next });
  };

  const showMonthDayPicker = recurrenceFrequency === 'MONTHLY' || recurrenceFrequency === 'SEMIANNUAL';

  return (
    <div className="border-t border-[var(--border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition"
      >
        <span>{t.calendar.sectionRecurrence}</span>
        <span className="text-[var(--foreground)]/30 text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="space-y-3 pb-3">
          <RecurrencePills
            value={recurrenceEnabled ? recurrenceFrequency : null}
            onChange={handleFrequencyChange}
          />

          {recurrenceEnabled && (
            <div className="space-y-3">
              {/* Interval + Until (not shown for SEMIANNUAL since interval is fixed to 6) */}
              {recurrenceFrequency !== 'SEMIANNUAL' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                      {t.calendar.recurrenceIntervalLabel}
                    </p>
                    <input
                      type="number"
                      min={1}
                      value={recurrenceInterval}
                      onChange={(e) => onChange({ recurrenceInterval: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                      {t.calendar.recurrenceUntilLabel}
                    </p>
                    <input
                      type="date"
                      value={recurrenceUntil}
                      onChange={(e) => onChange({ recurrenceUntil: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
                    />
                  </div>
                </div>
              )}

              {/* Weekday toggles for WEEKLY */}
              {recurrenceFrequency === 'WEEKLY' && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                    {t.calendar.recurrenceWeekdaysLabel}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAY_LABELS.map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleWeekday(idx)}
                        className={[
                          'rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                          recurrenceWeekdays.includes(idx)
                            ? 'border-[var(--sidebar)] bg-[var(--sidebar)] text-white'
                            : 'border-[var(--border)] text-[var(--foreground)]/60 hover:bg-[var(--surface-muted)]',
                        ].join(' ')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Month-day grid for MONTHLY / SEMIANNUAL */}
              {showMonthDayPicker && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                    {t.calendar.recurrenceMonthDaysLabel}
                  </p>
                  <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleMonthDay(day)}
                        className={[
                          'rounded-lg py-1.5 text-xs font-medium transition',
                          recurrenceMonthDays.includes(day)
                            ? 'bg-[var(--sidebar)] text-white'
                            : 'bg-[var(--surface-muted)] text-[var(--foreground)]/60 hover:bg-[var(--border)]',
                        ].join(' ')}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
