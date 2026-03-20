'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { ViewTabs } from './ViewTabs';
import { CalendarVisibilityFilter } from './CalendarVisibilityFilter';
import type { MemberOption, ViewMode } from '../types';

interface CalendarTopbarProps {
  rangeLabel: string;
  viewMode: ViewMode;
  members: MemberOption[];
  selectedOwners: string[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (mode: ViewMode) => void;
  onToggleOwner: (userId: string) => void;
  onFiltersOpen: () => void;
  onShareOpen: () => void;
  onNewEvent: () => void;
}

export function CalendarTopbar({
  rangeLabel,
  viewMode,
  members,
  selectedOwners,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onToggleOwner,
  onFiltersOpen,
  onShareOpen,
  onNewEvent,
}: CalendarTopbarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-4 py-3">
      {/* Period navigation */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          aria-label={t.calendar.prevMonthAction}
        >
          ‹
        </button>
        <span className="min-w-[140px] text-center text-sm font-bold text-[var(--foreground)]">
          {rangeLabel}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          aria-label={t.calendar.nextMonthAction}
        >
          ›
        </button>
      </div>

      {/* Today button */}
      <button
        type="button"
        onClick={onToday}
        className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]/70 transition hover:bg-[var(--surface-muted)]"
      >
        {t.calendar.todayAction}
      </button>

      {/* View tabs */}
      <ViewTabs current={viewMode} onChange={onViewChange} />

      {/* Inline owner filter dots */}
      <CalendarVisibilityFilter
        members={members}
        selectedOwners={selectedOwners}
        onToggle={onToggleOwner}
      />

      {/* Right-side action buttons */}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onFiltersOpen}
          className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 transition hover:bg-[var(--surface-muted)]"
        >
          {t.calendar.openFilters}
        </button>
        <button
          type="button"
          onClick={onShareOpen}
          className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 transition hover:bg-[var(--surface-muted)]"
        >
          {t.calendar.openShare}
        </button>
        <button
          type="button"
          onClick={onNewEvent}
          className="rounded-xl bg-[var(--sidebar)] px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          {t.calendar.openCreate}
        </button>
      </div>
    </div>
  );
}
