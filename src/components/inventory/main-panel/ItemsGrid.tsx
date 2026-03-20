'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import type { InventoryItem } from '@/components/inventory/types';
import { ItemCard } from '@/components/inventory/main-panel/ItemCard';
import { ItemEmptyState } from '@/components/inventory/main-panel/ItemEmptyState';

type GridLabels = {
  noBrand: string;
  min: string;
  lastPurchased: string;
  consume: string;
  restock: string;
  delete: string;
  addItem: string;
  emptyLocation: string;
  emptyLocationHint: string;
  status: { ok: string; low: string; empty: string };
};

type Props = {
  items: InventoryItem[];
  isLoading: boolean;
  onConsume: (item: InventoryItem) => void;
  onRestock: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAddItem: () => void;
  labels: GridLabels;
};

export function ItemsGrid({
  items,
  isLoading,
  onConsume,
  onRestock,
  onEdit,
  onDelete,
  onAddItem,
  labels,
}: Props) {
  if (isLoading) {
    return (
      <div
        className="grid gap-3 p-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <ItemEmptyState
        title={labels.emptyLocation}
        hint={labels.emptyLocationHint}
        onAdd={onAddItem}
        addLabel={labels.addItem}
      />
    );
  }

  const cardLabels = {
    noBrand: labels.noBrand,
    min: labels.min,
    lastPurchased: labels.lastPurchased,
    consume: labels.consume,
    restock: labels.restock,
    delete: labels.delete,
    status: labels.status,
  };

  return (
    <div
      className="grid gap-3 p-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onConsume={() => onConsume(item)}
          onRestock={() => onRestock(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          labels={cardLabels}
        />
      ))}
      <button
        type="button"
        onClick={onAddItem}
        className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-transparent p-4 text-zinc-400 transition-colors hover:border-[var(--sidebar)] hover:text-[var(--sidebar)]"
        aria-label={labels.addItem}
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-xs font-medium">{labels.addItem}</span>
      </button>
    </div>
  );
}
