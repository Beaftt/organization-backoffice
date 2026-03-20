'use client';

import type { ReminderItem } from '@/components/reminders/types';

type Props = {
  item: ReminderItem;
  disabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onOpenDetails: () => void;
  labels: {
    deleteItem: string;
    itemDetailsTitle: string;
  };
};

export function ListItemRow({ item, disabled, onToggle, onDelete, onOpenDetails, labels }: Props) {
  const isDone = item.status === 'DONE';

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[var(--surface-muted)]">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={item.title}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors ${
          isDone
            ? 'border-[var(--sidebar)] bg-[var(--sidebar)]'
            : 'border-zinc-300 bg-transparent hover:border-[var(--sidebar)]'
        }`}
      >
        {isDone ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </button>

      <span
        className={`flex-1 cursor-pointer text-sm transition-colors ${
          isDone ? 'line-through text-zinc-400' : 'text-[var(--foreground)]'
        }`}
        onClick={onOpenDetails}
      >
        {item.title}
      </span>

      {item.dueDate ? (
        <span className="hidden text-xs text-zinc-400 sm:block">{item.dueDate}</span>
      ) : null}

      <div className="flex items-center gap-0.5 opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          title={labels.itemDetailsTitle}
          onClick={onOpenDetails}
          className="rounded-lg p-1 text-zinc-400 hover:bg-[var(--border)] hover:text-[var(--foreground)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button
          type="button"
          title={labels.deleteItem}
          onClick={onDelete}
          className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  );
}
