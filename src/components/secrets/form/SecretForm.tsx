'use client';

import type { SecretType } from '../types';
import { SecretTypeSelector } from './SecretTypeSelector';
import { SecretFieldGroup } from './SecretFieldGroup';
import { useLanguage } from '@/lib/i18n/language-context';

export type SecretFormValues = {
  title: string;
  type: SecretType;
  username: string;
  url: string;
  port: string;
  secret: string;
  notes: string;
};

interface SecretFormProps {
  values: SecretFormValues;
  onChange: (values: SecretFormValues) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
  isEdit?: boolean;
}

export function SecretForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: SecretFormProps) {
  const { t } = useLanguage();

  const set = <K extends keyof SecretFormValues>(key: K, value: SecretFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const handleTypeChange = (type: SecretType) => {
    // When type changes, preserve secret value but reset type-specific fields
    onChange({ ...values, type, username: '', url: '', port: '' });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {/* Title */}
      <div>
        <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
          {t.secrets?.form?.title ?? 'Título'}
          <span className="ml-0.5 text-red-500">*</span>
        </p>
        <input
          type="text"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder={t.secrets?.form?.titlePlaceholder ?? 'Ex: Conta principal, API Stripe…'}
          required
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        />
      </div>

      <div className="border-t border-[var(--border)]" />

      {/* Type selector */}
      <SecretTypeSelector value={values.type} onChange={handleTypeChange} />

      <div className="border-t border-[var(--border)]" />

      {/* Dynamic fields by type */}
      <SecretFieldGroup
        type={values.type}
        values={{ username: values.username, url: values.url, port: values.port, secret: values.secret }}
        onChange={(key, value) => set(key, value)}
      />

      <div className="border-t border-[var(--border)]" />

      {/* Notes */}
      <div>
        <p className="mb-1 text-xs font-semibold text-[var(--foreground)]/60">
          {t.secrets?.form?.notes ?? 'Notas (opcional)'}
        </p>
        <textarea
          value={values.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder={t.secrets?.form?.notesPlaceholder ?? 'Observações sobre este segredo…'}
          rows={3}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--sidebar)]/30"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)]"
        >
          {t.secrets?.form?.cancel ?? 'Cancelar'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[var(--sidebar)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? (t.secrets?.saving ?? 'Salvando…')
            : (t.secrets?.form?.save ?? 'Salvar segredo')}
        </button>
      </div>
    </form>
  );
}
