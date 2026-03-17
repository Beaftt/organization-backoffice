'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/client';
import { updateInventoryItem, type InventoryItem, type InventoryItemUnit } from '@/lib/api/inventory';
import { useLanguage } from '@/lib/i18n/language-context';

const UNIT_OPTIONS: InventoryItemUnit[] = ['UN', 'CX', 'PCT', 'KG', 'G', 'L', 'ML', 'M', 'PAR'];

interface InventoryEditItemModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: (updated: InventoryItem) => void;
  onError: (msg: string) => void;
}

export function InventoryEditItemModal({ item, onClose, onSuccess, onError }: InventoryEditItemModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(item.name);
  const [brand, setBrand] = useState(item.brand ?? '');
  const [unit, setUnit] = useState<InventoryItemUnit>(item.unit);
  const [minimumQuantity, setMinimumQuantity] = useState(String(item.minimumQuantity ?? 0));
  const [notes, setNotes] = useState(item.notes ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMinQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+\.?\d{0,3}$/.test(val)) setMinimumQuantity(val);
  };

  const handleMinQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMinimumQuantity((prev) => String((parseFloat(prev) || 0) + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMinimumQuantity((prev) => String(Math.max(0, (parseFloat(prev) || 0) - 1)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await updateInventoryItem({
        id: item.id,
        name: name.trim(),
        brand: brand.trim() || null,
        unit,
        minimumQuantity: parseFloat(minimumQuantity) || 0,
        notes: notes.trim() || null,
      });
      onSuccess(updated);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : t.inventory.editError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.inventory.editItem}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content w-full max-w-md rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-[var(--foreground)]">{t.inventory.editItem}</h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <Input
            label={t.inventory.nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.inventory.namePlaceholder}
            autoFocus
          />
          <Input
            label={`${t.inventory.brandLabel} (${t.inventory.optional})`}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={t.inventory.brandPlaceholder}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--foreground)]">{t.inventory.unitLabel}</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as InventoryItemUnit)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <Input
            label={t.inventory.minQuantityLabel}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={minimumQuantity}
            onChange={handleMinQtyChange}
            onKeyDown={handleMinQtyKeyDown}
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
            <Button type="submit" className="flex-1" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? t.inventory.saving : t.inventory.confirm}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
