'use client';

import { createPortal } from 'react-dom';
import { useLanguage } from '@/lib/i18n/language-context';
import type { SecretSummary } from '../types';

interface DeleteSecretConfirmProps {
  secret: SecretSummary | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteSecretConfirm({
  secret,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteSecretConfirmProps) {
  const { t } = useLanguage();

  if (!secret) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content w-full max-w-sm rounded-2xl bg-[var(--surface)] p-6 shadow-xl">
        <h2 className="text-base font-bold text-[var(--foreground)]">
          {t.secrets?.deleteTitle ?? 'Excluir segredo'}
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)]/60">
          {t.secrets?.deleteConfirmMsg
            ? t.secrets.deleteConfirmMsg.replace('{{title}}', secret.title)
            : `Tem certeza que deseja excluir "${secret.title}"? Esta ação não pode ser desfeita.`
          }
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
          >
            {t.secrets?.form?.cancel ?? 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting
              ? (t.secrets?.deleting ?? 'Excluindo…')
              : (t.secrets?.delete ?? 'Excluir')
            }
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
