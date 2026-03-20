'use client';

import { createPortal } from 'react-dom';
import { useLanguage } from '@/lib/i18n/language-context';
import type { MemberOption } from '../types';

interface FiltersModalProps {
  open: boolean;
  fromDate: string;
  toDate: string;
  tagFilter: string;
  members: MemberOption[];
  selectedOwners: string[];
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onTagChange: (v: string) => void;
  onToggleOwner: (userId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function FiltersModal({
  open,
  fromDate,
  toDate,
  tagFilter,
  members,
  selectedOwners,
  onFromChange,
  onToChange,
  onTagChange,
  onToggleOwner,
  onSelectAll,
  onClearAll,
  onClose,
}: FiltersModalProps) {
  const { t } = useLanguage();

  if (!open) return null;

  const allSelected = selectedOwners.length === 0;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-bold text-[var(--foreground)]">{t.calendar.filtersTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.filterDateFromLabel}</p>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.filterDateToLabel}</p>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToChange(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.tagsLabel}</p>
            <input
              type="text"
              value={tagFilter}
              onChange={(e) => onTagChange(e.target.value)}
              placeholder={t.calendar.tagsPlaceholder}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
            />
          </div>

          {/* Owner filter */}
          <div>
            <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">{t.calendar.filterOwnersLabel}</p>
            <p className="mb-3 text-xs text-[var(--foreground)]/40">{t.calendar.filterOwnersHint}</p>
            <div className="flex flex-wrap gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs transition hover:bg-[var(--surface-muted)]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="accent-[var(--sidebar)]"
                />
                {t.calendar.filterOwnersAllLabel}
              </label>
              {members.map((member) => (
                <label
                  key={member.userId}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs transition hover:bg-[var(--surface-muted)]"
                >
                  <input
                    type="checkbox"
                    checked={!allSelected && selectedOwners.includes(member.userId)}
                    onChange={() => onToggleOwner(member.userId)}
                    className="accent-[var(--sidebar)]"
                  />
                  {member.label}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)]"
            >
              {t.calendar.clearFilters}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[var(--sidebar)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t.calendar.applyFilters}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
