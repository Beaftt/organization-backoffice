'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/client';
import { createInventoryItem, type InventoryItem, type InventoryItemUnit } from '@/lib/api/inventory';
import { useLanguage } from '@/lib/i18n/language-context';

const UNIT_OPTIONS: InventoryItemUnit[] = ['UN', 'CX', 'PCT', 'KG', 'G', 'L', 'ML', 'M', 'PAR'];

interface InventoryAddItemModalProps {
  locationId: string;
  onClose: () => void;
  onCreated: (item: InventoryItem) => void;
  onError: (msg: string) => void;
}

export function InventoryAddItemModal({ locationId, onClose, onCreated, onError }: InventoryAddItemModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState<InventoryItemUnit>('UN');
  const [quantity, setQuantity] = useState('0');
  const [minimumQuantity, setMinimumQuantity] = useState('0');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const item = await createInventoryItem({
        locationId,
        name: name.trim(),
        brand: brand.trim() || null,
        unit,
        quantity: parseFloat(quantity) || 0,
        minimumQuantity: parseFloat(minimumQuantity) || 0,
        notes: notes.trim() || null,
      });
      onCreated(item);
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
      aria-label={t.inventory.addItem}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content w-full max-w-md rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-[var(--foreground)]">{t.inventory.addItem}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label={t.inventory.nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.inventory.namePlaceholder}
            required
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
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.inventory.quantityLabel}
              type="number"
              min="0"
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input
              label={t.inventory.minQuantityLabel}
              type="number"
              min="0"
              step="0.001"
              value={minimumQuantity}
              onChange={(e) => setMinimumQuantity(e.target.value)}
            />
          </div>

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
              {isSubmitting ? t.inventory.saving : t.inventory.createItem}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
