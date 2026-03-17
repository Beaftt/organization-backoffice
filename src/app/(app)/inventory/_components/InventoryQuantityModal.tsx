'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/client';
import { consumeInventoryItem, restockInventoryItem, type InventoryItem } from '@/lib/api/inventory';
import { useLanguage } from '@/lib/i18n/language-context';

interface InventoryQuantityModalProps {
  mode: 'consume' | 'restock';
  item: InventoryItem;
  onClose: () => void;
  onSuccess: (updated: InventoryItem) => void;
  onError: (msg: string) => void;
}

export function InventoryQuantityModal({ mode, item, onClose, onSuccess, onError }: InventoryQuantityModalProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = mode === 'consume' ? t.inventory.consumeTitle : t.inventory.restockTitle;

  // Arrows always step by 1 integer; typing allows up to 3 decimal places
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+\.?\d{0,3}$/.test(val)) {
      setQuantity(val);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setQuantity((prev) => String((parseFloat(prev) || 0) + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setQuantity((prev) => String(Math.max(0, (parseFloat(prev) || 0) - 1)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    setIsSubmitting(true);
    try {
      const updated =
        mode === 'consume'
          ? await consumeInventoryItem({ id: item.id, quantity: qty, notes: notes || null })
          : await restockInventoryItem({ id: item.id, quantity: qty, notes: notes || null });
      onSuccess(updated);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : t.inventory.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content w-full max-w-sm rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h2 className="mb-1 text-base font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mb-4 text-sm text-[var(--foreground)] opacity-60">{item.name} · {item.unit}</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <Input
            label={t.inventory.quantityLabel}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={quantity}
            onChange={handleQuantityChange}
            onKeyDown={handleQuantityKeyDown}
            autoFocus
          />
          <Input
            label={`${t.inventory.notesLabel} (${t.inventory.optional})`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.inventory.notesPlaceholder}
          />

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              {t.inventory.cancel}
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}>
              {isSubmitting ? t.inventory.saving : t.inventory.confirm}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
