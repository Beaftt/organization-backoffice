'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';

type Props = {
  isOpen: boolean;
  itemName: string;
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteConfirmModal({
  isOpen,
  itemName,
  isDeleting,
  error,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.documents.deleteTitle}</h3>
          <button
            className="text-zinc-500 hover:text-zinc-700"
            onClick={onClose}
            type="button"
            aria-label={t.documents.cancel}
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm text-[var(--foreground)]/70">
          {t.documents.deleteConfirm}{' '}
          <strong className="text-[var(--foreground)]">{itemName}</strong>?
        </p>

        {error ? (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.documents.cancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t.documents.saving : t.documents.deleteAction}
          </Button>
        </div>
      </div>
    </div>
  );
}
