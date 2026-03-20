'use client';

import type { InventoryLocation } from '@/components/inventory/types';

type Props = {
  location: InventoryLocation;
  totalCount: number;
  lowStockCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  onAddItem: () => void;
  labels: {
    addItem: string;
    searchItems: string;
    items: string;
    itemSingular: string;
    lowStockCount: string;
  };
};

export function InventoryHeader({
  location,
  totalCount,
  lowStockCount,
  search,
  onSearchChange,
  onAddItem,
  labels,
}: Props) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] px-5 py-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-[var(--foreground)]">{location.name}</h2>
        <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
          {totalCount} {totalCount === 1 ? labels.itemSingular : labels.items}
          {lowStockCount > 0 && (
            <>
              {' '}
              ·{' '}
              <span className="font-medium text-amber-500">
                {lowStockCount} {labels.lowStockCount}
              </span>
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          type="text"
          placeholder={labels.searchItems}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-36 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)] sm:w-44"
        />
        <button
          type="button"
          onClick={onAddItem}
          className="whitespace-nowrap rounded-xl bg-[var(--sidebar)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          + {labels.addItem}
        </button>
      </div>
    </div>
  );
}
