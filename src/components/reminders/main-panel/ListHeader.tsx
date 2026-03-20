'use client';

import type { ReminderList } from '@/components/reminders/types';

type Props = {
  list: ReminderList;
  color: string;
  totalCount: number;
  onEdit: () => void;
  onDelete: () => void;
  labels: {
    editList: string;
    deleteList: string;
    monthly: string;
    financeLinked: string;
    calendarLinked: string;
    isPrivate: string;
    items: string;
  };
};

export function ListHeader({ list, color, totalCount, onEdit, onDelete, labels }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[var(--foreground)]">
            {list.title}
          </h3>
          {list.description ? (
            <p className="mt-0.5 truncate text-xs text-zinc-400">{list.description}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-px text-[10px] font-medium text-zinc-500">
              {totalCount} {labels.items}
            </span>
            {list.isPrivate ? (
              <span className="rounded-full bg-zinc-100 px-2 py-px text-[10px] font-medium text-zinc-600">
                🔒 {labels.isPrivate}
              </span>
            ) : null}
            {list.recurrence === 'MONTHLY' ? (
              <span className="rounded-full bg-[var(--surface-muted)] px-2 py-px text-[10px] font-medium text-zinc-500">
                🔄 {labels.monthly}
              </span>
            ) : null}
            {list.linkToFinance ? (
              <span className="rounded-full bg-emerald-100 px-2 py-px text-[10px] font-medium text-emerald-700">
                💰 {labels.financeLinked}
              </span>
            ) : null}
            {list.linkToCalendar ? (
              <span className="rounded-full bg-blue-100 px-2 py-px text-[10px] font-medium text-blue-700">
                📅 {labels.calendarLinked}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          title={labels.editList}
          onClick={onEdit}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button
          type="button"
          title={labels.deleteList}
          onClick={onDelete}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  );
}
