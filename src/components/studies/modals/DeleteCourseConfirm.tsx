'use client';

import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  title: string;
  message: string;
  courseName: string;
  confirmLabel: string;
  cancelLabel: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteCourseConfirm({
  open,
  title,
  message,
  courseName,
  confirmLabel,
  cancelLabel,
  isDeleting,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="modal-content w-full max-w-sm rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--foreground)]/60">
          {message} <span className="font-semibold text-[var(--foreground)]">{courseName}</span>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]/65 transition hover:bg-[var(--surface-muted)]"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-xl bg-[var(--expense)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? confirmLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
