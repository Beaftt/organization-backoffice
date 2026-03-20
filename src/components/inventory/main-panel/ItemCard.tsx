'use client';

import type { InventoryItem } from '@/components/inventory/types';
import { getStockStatus } from '@/components/inventory/types';
import { ItemStatusBadge } from '@/components/inventory/main-panel/ItemStatusBadge';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

type Labels = {
  noBrand: string;
  min: string;
  lastPurchased: string;
  consume: string;
  restock: string;
  delete: string;
  status: { ok: string; low: string; empty: string };
};

type Props = {
  item: InventoryItem;
  onConsume: () => void;
  onRestock: () => void;
  onEdit: () => void;
  onDelete: () => void;
  labels: Labels;
};

export function ItemCard({ item, onConsume, onRestock, onEdit, onDelete, labels }: Props) {
  const status = getStockStatus(item.status);
  const isAlert = status !== 'ok';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-[var(--surface)] transition-[border-color] duration-150 ${
        isAlert
          ? 'border-rose-200 hover:border-rose-400'
          : 'border-[var(--border)] hover:border-[var(--sidebar)]'
      }`}
    >
      {/* Body — click to edit */}
      <div
        className="cursor-pointer p-3.5"
        onClick={onEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onEdit()}
        aria-label={`Editar ${item.name}`}
      >
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">{item.name}</p>
            <p className="mt-0.5 text-xs text-[var(--foreground)]/50">{item.brand ?? labels.noBrand}</p>
          </div>
          <ItemStatusBadge status={status} labels={labels.status} />
        </div>

        <div className="mb-1.5 flex items-center gap-2.5">
          <div className="flex items-baseline gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
            <span className="text-base font-extrabold leading-none text-[var(--foreground)]">
              {Number(item.quantity).toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </span>
            <span className="text-[10px] font-bold text-[var(--foreground)]/50">{item.unit}</span>
          </div>
          <span className="text-xs text-zinc-400">
            {labels.min}:{' '}
            <strong className="text-[var(--foreground)]">{item.minimumQuantity}</strong>
          </span>
        </div>

        {item.lastPurchasedAt ? (
          <p className="text-[10.5px] text-[var(--foreground)]/50">
            {labels.lastPurchased}: {formatDate(item.lastPurchasedAt)}
          </p>
        ) : null}
      </div>

      {/* Footer actions */}
      <div className="flex border-t border-[var(--border)]">
        <button
          type="button"
          className="flex-1 py-2 text-xs font-semibold text-[var(--foreground)]/60 transition-colors hover:bg-emerald-500/10 hover:text-emerald-500"
          onClick={onConsume}
          aria-label={`${labels.consume} ${item.name}`}
        >
          − {labels.consume}
        </button>
        <div className="w-px bg-[var(--border)]" />
        <button
          type="button"
          className="flex-1 py-2 text-xs font-semibold text-[var(--foreground)]/60 transition-colors hover:bg-[var(--sidebar)]/10 hover:text-[var(--sidebar)]"
          onClick={onRestock}
          aria-label={`${labels.restock} ${item.name}`}
        >
          + {labels.restock}
        </button>
        <div className="w-px bg-[var(--border)]" />
        <button
          type="button"
          className="px-3 py-2 text-xs font-semibold text-[var(--foreground)]/50 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
          onClick={onDelete}
          aria-label={`${labels.delete} ${item.name}`}
        >
          {labels.delete}
        </button>
      </div>
    </div>
  );
}
