'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { ApiError } from '@/lib/api/client';
import {
  createInventoryItem,
  updateInventoryItem,
  type InventoryItem,
  type InventoryItemUnit,
  type InventoryLocation,
} from '@/lib/api/inventory';
import { UNIT_OPTIONS } from '@/components/inventory/types';
import { useLanguage } from '@/lib/i18n/language-context';

type Props = {
  item: InventoryItem | null;
  locationId: string | null;
  locations: InventoryLocation[];
  onClose: () => void;
  onCreated: (item: InventoryItem) => void;
  onUpdated: (item: InventoryItem) => void;
  onError: (msg: string) => void;
};

type FormState = {
  name: string;
  brand: string;
  unit: InventoryItemUnit;
  locationId: string;
  quantity: string;
  minimumQuantity: string;
  lastPurchasedAt: string | null;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  brand: '',
  unit: 'UN',
  locationId: '',
  quantity: '0',
  minimumQuantity: '0',
  lastPurchasedAt: null,
  notes: '',
};

export function AddItemDrawer({
  item,
  locationId,
  locations,
  onClose,
  onCreated,
  onUpdated,
  onError,
}: Props) {
  const { t } = useLanguage();
  const isEditing = item !== null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        brand: item.brand ?? '',
        unit: item.unit,
        locationId: item.locationId,
        quantity: String(item.quantity),
        minimumQuantity: String(item.minimumQuantity),
        lastPurchasedAt: item.lastPurchasedAt ?? null,
        notes: item.notes ?? '',
      });
    } else {
      setForm({ ...EMPTY_FORM, locationId: locationId ?? locations[0]?.id ?? '' });
    }
  }, [item, locationId, locations]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setIsSubmitting(true);
    try {
      if (isEditing && item) {
        const updated = await updateInventoryItem({
          id: item.id,
          name: form.name.trim(),
          brand: form.brand.trim() || null,
          unit: form.unit,
          minimumQuantity: parseFloat(form.minimumQuantity) || 0,
          notes: form.notes.trim() || null,
        });
        onUpdated(updated);
      } else {
        const created = await createInventoryItem({
          locationId: form.locationId,
          name: form.name.trim(),
          brand: form.brand.trim() || null,
          unit: form.unit,
          quantity: parseFloat(form.quantity) || 0,
          minimumQuantity: parseFloat(form.minimumQuantity) || 0,
          notes: form.notes.trim() || null,
        });
        onCreated(created);
      }
    } catch (err) {
      onError(err instanceof ApiError ? err.message : t.inventory.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inv = t.inventory;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">
            {isEditing ? inv.editItem : inv.addItemLabel ?? inv.addItem}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            aria-label={inv.cancel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col overflow-y-auto">

          {/* Group 1: Identificação */}
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {inv.nameLabel}
              </label>
              <input
                type="text"
                autoFocus
                placeholder={inv.namePlaceholder}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {inv.brandLabel} ({inv.optional})
              </label>
              <input
                type="text"
                placeholder={inv.brandPlaceholder}
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
              />
            </div>
          </div>

          <div className="border-t border-[var(--border)]" />

          {/* Group 2: Classificação */}
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className={`grid gap-3 ${!isEditing ? 'grid-cols-2' : ''}`}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {inv.unitLabel}
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value as InventoryItemUnit }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              {!isEditing && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {inv.locationLabel ?? 'Local'}
                  </label>
                  <select
                    value={form.locationId}
                    onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[var(--border)]" />

          {/* Group 3: Estoque */}
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className={`grid gap-3 ${!isEditing ? 'grid-cols-2' : ''}`}>
              {!isEditing && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {inv.quantityLabel}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
                  />
                </div>
              )}
              <div className={`flex flex-col gap-1.5 ${isEditing ? 'col-span-2' : ''}`}>
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {inv.minQuantityLabel}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.minimumQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, minimumQuantity: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
                />
              </div>
            </div>
            {isEditing && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {inv.lastPurchaseDate ?? inv.lastPurchased}
                </label>
                <input
                  type="date"
                  disabled
                  value={form.lastPurchasedAt?.slice(0, 10) ?? ''}
                  className="w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-zinc-400 focus:outline-none"
                />
                <p className="text-[10.5px] text-zinc-400">
                  {inv.lastPurchaseDateHint ?? ''}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)]" />

          {/* Group 4: Detalhes */}
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {inv.notesLabel} ({inv.optional})
              </label>
              <textarea
                placeholder={inv.notesPlaceholder}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]"
              />
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs text-amber-700">
                {inv.minStockHint ?? inv.minQuantityLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex shrink-0 gap-2 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            {inv.cancel}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !form.name.trim()}
            className="flex-[2] rounded-xl bg-[var(--sidebar)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {isSubmitting
              ? inv.saving
              : isEditing
                ? inv.saveItem ?? inv.confirm
                : inv.createItem}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
