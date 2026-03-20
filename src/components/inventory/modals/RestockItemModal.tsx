'use client';

import { createPortal } from 'react-dom';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { restockInventoryItem, type InventoryItem } from '@/lib/api/inventory';
import { getStockStatus } from '@/components/inventory/types';
import { QuantityStepper } from '@/components/inventory/shared/QuantityStepper';
import { useLanguage } from '@/lib/i18n/language-context';

type Props = {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: (updated: InventoryItem) => void;
  onError: (msg: string) => void;
};

export function RestockItemModal({ item, onClose, onSuccess, onError }: Props) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const afterQty = item.quantity + quantity;
  const afterApiStatus =
    afterQty <= 0 ? 'OUT_OF_STOCK' : afterQty <= item.minimumQuantity ? 'LOW' : 'IN_STOCK';
  const afterStatus = getStockStatus(afterApiStatus);
  const feedbackClass =
    afterStatus === 'empty'
      ? 'text-rose-600'
      : afterStatus === 'low'
        ? 'text-amber-600'
        : 'text-emerald-600';

  const inv = t.inventory;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updated = await restockInventoryItem({
        id: item.id,
        quantity,
        notes: notes.trim() || null,
      });
      onSuccess(updated);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : inv.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-content w-full max-w-sm rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h3 className="mb-0.5 text-sm font-bold text-[var(--foreground)]">{inv.restockTitle}</h3>
        <p className="mb-4 text-xs text-zinc-400">
          {item.name}
          {item.brand ? ` · ${item.brand}` : ''} · {inv.currentStock ?? inv.quantityLabel}:{' '}
          <strong>{item.quantity}</strong> {item.unit}
        </p>

        <div className="mb-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {inv.quantityLabel}
          </label>
          <QuantityStepper value={quantity} min={1} max={9999} onChange={setQuantity} />
        </div>

        <p className={`mb-4 text-xs font-medium ${feedbackClass}`}>
          {inv.afterRestock ?? 'Após reposição'}:{' '}
          <strong>
            {afterQty} {item.unit}
          </strong>
          {afterStatus === 'low' && ` — ${inv.statusLow}`}
        </p>

        <div className="mb-4 flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {inv.notesLabel} ({inv.optional})
          </label>
          <input
            type="text"
            placeholder={inv.notesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-[var(--surface-muted)]"
          >
            {inv.cancel}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="flex-[2] rounded-xl bg-[var(--sidebar)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {isSubmitting ? inv.saving : inv.confirmRestock ?? inv.confirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
