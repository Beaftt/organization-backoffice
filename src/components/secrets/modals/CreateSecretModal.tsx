'use client';

import { createPortal } from 'react-dom';
import type { SecretFormValues } from '../form/SecretForm';
import { SecretForm } from '../form/SecretForm';
import { useLanguage } from '@/lib/i18n/language-context';

interface CreateSecretModalProps {
  open: boolean;
  values: SecretFormValues;
  onChange: (v: SecretFormValues) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
  isEdit?: boolean;
}

export function CreateSecretModal({
  open,
  values,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
  isEdit = false,
}: CreateSecretModalProps) {
  const { t } = useLanguage();

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-bold text-[var(--foreground)]">
            {isEdit
              ? (t.secrets?.editModalTitle ?? 'Editar segredo')
              : (t.secrets?.modalTitle ?? 'Novo segredo')
            }
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--foreground)]/50 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <SecretForm
            values={values}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            error={error}
            isEdit={isEdit}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
