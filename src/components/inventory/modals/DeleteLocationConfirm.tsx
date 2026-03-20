'use client';

import { createPortal } from 'react-dom';
import { useState } from 'react';
import type { InventoryLocation } from '@/components/inventory/types';
import { useLanguage } from '@/lib/i18n/language-context';

type Props = {
  location: InventoryLocation;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function DeleteLocationConfirm({ location, onClose, onConfirm }: Props) {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const inv = t.inventory;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-content w-full max-w-xs rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h3 className="mb-1 text-sm font-bold text-[var(--foreground)]">
          {inv.locationDeleteConfirm}
        </h3>
        <p className="mb-1 text-xs font-semibold text-zinc-500">{location.name}</p>
        <p className="mb-5 text-xs text-zinc-400">
          {inv.deleteLocationWarning ?? inv.deleteConfirm}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-[var(--surface-muted)] disabled:opacity-50"
          >
            {inv.cancel}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          >
            {isDeleting ? inv.saving : inv.delete}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
