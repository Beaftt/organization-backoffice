'use client';

import { createPortal } from 'react-dom';
import { useLanguage } from '@/lib/i18n/language-context';
import type { CalendarEvent } from '../types';

interface DeleteEventConfirmProps {
  event: CalendarEvent | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteEventConfirm({ event, isDeleting, onConfirm, onClose }: DeleteEventConfirmProps) {
  const { t } = useLanguage();

  if (!event) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl">
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-sm font-bold text-[var(--foreground)]">{t.calendar.deleteAction}</h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/60">
            <strong className="text-[var(--foreground)]">{event.title}</strong>
          </p>
        </div>
        <div className="flex gap-2 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)]"
          >
            {t.calendar.closeAction}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-rose-500 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
          >
            {isDeleting ? '...' : t.calendar.deleteAction}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
