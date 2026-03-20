'use client';

import type { ReminderList, ReminderItem } from '@/components/reminders/types';

type Props = {
  list: ReminderList;
  items: ReminderItem[];
  isSelected: boolean;
  color: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  labels: {
    edit: string;
    delete: string;
    monthly: string;
    financeLinked: string;
    calendarLinked: string;
  };
};

export function ListSidebarItem({
  list,
  items,
  isSelected,
  color,
  onSelect,
  onEdit,
  onDelete,
  labels,
}: Props) {
  const doneCount = items.filter((i) => i.status === 'DONE').length;

  return (
    <div
      className={`group flex cursor-pointer items-start gap-3 border-l-2 rounded-r-xl py-2.5 pl-3 pr-3 transition-all ${
        isSelected
          ? 'border-l-[var(--sidebar)] bg-[var(--surface)] shadow-sm'
          : 'border-l-transparent hover:bg-[var(--surface-muted)]'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-selected={isSelected}
    >
      <span
        className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">{list.title}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {list.recurrence === 'MONTHLY' ? (
            <span className="rounded-full bg-[var(--surface-muted)] px-1.5 py-px text-[10px] font-medium text-zinc-500">
              {labels.monthly}
            </span>
          ) : null}
          {list.linkToFinance ? (
            <span className="rounded-full bg-emerald-100 px-1.5 py-px text-[10px] font-medium text-emerald-700">
              {labels.financeLinked}
            </span>
          ) : null}
          {list.linkToCalendar ? (
            <span className="rounded-full bg-blue-100 px-1.5 py-px text-[10px] font-medium text-blue-700">
              {labels.calendarLinked}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-zinc-400">
          {doneCount}/{items.length}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          title={labels.edit}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="rounded-lg p-1 text-zinc-400 hover:bg-[var(--border)] hover:text-[var(--foreground)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button
          type="button"
          title={labels.delete}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  );
}
