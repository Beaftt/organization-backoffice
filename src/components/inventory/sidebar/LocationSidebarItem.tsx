'use client';

import type { InventoryItem, InventoryLocation } from '@/components/inventory/types';

type Props = {
  location: InventoryLocation;
  items: InventoryItem[] | undefined;
  isSelected: boolean;
  isEditing: boolean;
  editName: string;
  isSaving: boolean;
  onSelect: () => void;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditNameChange: (v: string) => void;
  onDelete: () => void;
  labels: { edit: string; delete: string; save: string; cancel: string };
};

export function LocationSidebarItem({
  location,
  items,
  isSelected,
  isEditing,
  editName,
  isSaving,
  onSelect,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditNameChange,
  onDelete,
  labels,
}: Props) {
  const itemCount = items?.length ?? 0;
  const lowCount = items?.filter((i) => i.status === 'LOW' || i.status === 'OUT_OF_STOCK').length ?? 0;

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5">
        <input
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--sidebar)]"
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditSave();
            if (e.key === 'Escape') onEditCancel();
          }}
        />
        <button
          onClick={onEditSave}
          disabled={isSaving || !editName.trim()}
          className="shrink-0 rounded-md bg-[var(--sidebar)] px-2 py-1 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          aria-label={labels.save}
        >
          {isSaving ? '…' : '✓'}
        </button>
        <button
          onClick={onEditCancel}
          className="shrink-0 rounded-md px-1.5 py-1 text-xs text-zinc-400 transition hover:text-[var(--foreground)]"
          aria-label={labels.cancel}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-2 border-l-2 py-2.5 pl-3 pr-2 transition-all ${
        isSelected
          ? 'border-l-[var(--sidebar)] bg-[var(--surface)] shadow-sm'
          : 'border-l-transparent hover:bg-[var(--surface-muted)]'
      }`}
    >
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[var(--foreground)]"
        onClick={onSelect}
        aria-pressed={isSelected}
      >
        {location.icon ? `${location.icon} ` : ''}{location.name}
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {items !== undefined && lowCount > 0 && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-1.5 py-px text-[10px] font-bold text-amber-600">
            ⚠ {lowCount}
          </span>
        )}
        {items !== undefined && (
          <span
            className={`rounded-full px-1.5 py-px text-[10.5px] font-semibold ${
              isSelected
                ? 'bg-[var(--sidebar)]/20 text-[var(--sidebar)]'
                : 'bg-[var(--surface)] text-zinc-400'
            }`}
          >
            {itemCount}
          </span>
        )}
        <div className="flex items-center opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            title={labels.edit}
            onClick={onEditStart}
            className="rounded p-1 text-zinc-400 hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            type="button"
            title={labels.delete}
            onClick={onDelete}
            className="rounded p-1 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
