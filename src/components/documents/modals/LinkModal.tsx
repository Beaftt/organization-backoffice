'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { DocumentReferenceModule, DocumentSummary } from '../types';

type LinkForm = {
  module: DocumentReferenceModule;
  sourceType: string;
  sourceId: string;
  title: string;
};

type Props = {
  isOpen: boolean;
  document: DocumentSummary | null;
  form: LinkForm;
  moduleLabels: Record<DocumentReferenceModule, string>;
  error: string | null;
  isSaving: boolean;
  onChange: (form: LinkForm) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function LinkModal({
  isOpen,
  document,
  form,
  moduleLabels,
  error,
  isSaving,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useLanguage();

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.documents.linkTitle}</h3>
          <button
            className="text-zinc-500 hover:text-zinc-700"
            onClick={onClose}
            type="button"
            aria-label={t.documents.cancel}
          >
            ✕
          </button>
        </div>

        <p className="mt-2 truncate text-sm text-[var(--foreground)]/60">
          {document.name}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            {t.documents.linkModuleLabel}
            <select
              value={form.module}
              onChange={(e) =>
                onChange({
                  ...form,
                  module: e.target.value as DocumentReferenceModule,
                })
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {Object.entries(moduleLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <Input
            label={t.documents.linkTypeLabel}
            value={form.sourceType}
            onChange={(e) => onChange({ ...form, sourceType: e.target.value })}
          />
          <Input
            label={t.documents.linkIdLabel}
            value={form.sourceId}
            onChange={(e) => onChange({ ...form, sourceId: e.target.value })}
          />
          <Input
            label={t.documents.linkTitleLabel}
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t.documents.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t.documents.saving : t.documents.linkConfirm}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
