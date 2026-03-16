'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ApiError } from '@/lib/api/client';
import { deleteInventoryItem, type InventoryItem, type InventoryItemStatus } from '@/lib/api/inventory';
import { useLanguage } from '@/lib/i18n/language-context';

const STATUS_COLORS: Record<InventoryItemStatus, string> = {
  IN_STOCK: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  LOW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  OUT_OF_STOCK: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

interface InventoryItemCardProps {
  item: InventoryItem;
  onConsume: () => void;
  onRestock: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onError: (msg: string) => void;
}

export function InventoryItemCard({ item, onConsume, onRestock, onEdit, onDeleted, onError }: InventoryItemCardProps) {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  const statusLabel: Record<InventoryItemStatus, string> = {
    IN_STOCK: t.inventory.statusInStock,
    LOW: t.inventory.statusLow,
    OUT_OF_STOCK: t.inventory.statusOutOfStock,
  };

  const handleDelete = async () => {
    if (!confirm(t.inventory.deleteConfirm)) return;
    setIsDeleting(true);
    try {
      await deleteInventoryItem({ id: item.id });
      onDeleted();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : t.inventory.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col gap-3">
      {/* Header: name + edit icon + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-[var(--foreground)]">{item.name}</p>
          {item.brand && (
            <p className="truncate text-xs text-[var(--foreground)] opacity-60">{item.brand}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="rounded-lg p-1 text-[var(--foreground)]/40 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]/80"
            aria-label={`${t.inventory.edit} ${item.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
            {statusLabel[item.status]}
          </span>
        </div>
      </div>

      {/* Quantity + minimum */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {Number(item.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} {item.unit}
        </Badge>
        {item.minimumQuantity > 0 && (
          <span className="text-xs text-[var(--foreground)] opacity-50">
            {t.inventory.minLabel}: {Number(item.minimumQuantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
          </span>
        )}
      </div>

      {item.lastPurchasedAt && (
        <p className="text-xs text-[var(--foreground)] opacity-50">
          {t.inventory.lastPurchased}: {new Date(item.lastPurchasedAt).toLocaleDateString('pt-BR')}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="secondary"
          className="flex-1 text-xs"
          onClick={onConsume}
          aria-label={`${t.inventory.consume} ${item.name}`}
        >
          − {t.inventory.consume}
        </Button>
        <Button
          variant="primary"
          className="flex-1 text-xs"
          onClick={onRestock}
          aria-label={`${t.inventory.restock} ${item.name}`}
        >
          + {t.inventory.restock}
        </Button>
        <Button
          variant="danger"
          className="px-3 text-xs"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label={`${t.inventory.delete} ${item.name}`}
        >
          {t.inventory.delete}
        </Button>
      </div>
    </Card>
  );
}
