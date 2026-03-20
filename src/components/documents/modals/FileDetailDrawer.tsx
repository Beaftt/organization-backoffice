'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DocumentReference, DocumentReferenceKind, DocumentSummary } from '../types';

type Props = {
  isOpen: boolean;
  document: DocumentSummary | null;
  references: DocumentReference[];
  isLoading: boolean;
  loadError: string | null;
  form: { title: string; mentionedUsers: string };
  formError: string | null;
  isSaving: boolean;
  kindLabels: Record<DocumentReferenceKind, string>;
  moduleLabels: Record<string, string>;
  onChangeForm: (form: { title: string; mentionedUsers: string }) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function FileDetailDrawer({
  isOpen,
  document,
  references,
  isLoading,
  loadError,
  form,
  formError,
  isSaving,
  kindLabels,
  moduleLabels,
  onChangeForm,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useLanguage();

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.documents.historyTitle}</h3>
          <button
            className="text-zinc-500 hover:text-zinc-700"
            onClick={onClose}
            type="button"
            aria-label={t.documents.close}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="text-xs text-[var(--foreground)]/50">{t.documents.fileLabel}</p>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {document.name}
          </p>
        </div>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input
            label={t.documents.references.titleLabel}
            placeholder={t.documents.references.titlePlaceholder}
            value={form.title}
            onChange={(e) => onChangeForm({ ...form, title: e.target.value })}
          />
          <Input
            label={t.documents.references.mentionUsersLabel}
            placeholder={t.documents.references.mentionUsersPlaceholder}
            value={form.mentionedUsers}
            onChange={(e) =>
              onChangeForm({ ...form, mentionedUsers: e.target.value })
            }
          />
          {formError ? <p className="text-sm text-red-500">{formError}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? t.documents.saving
                : t.documents.references.createAction}
            </Button>
          </div>
        </form>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : loadError ? (
            <p className="text-sm text-red-500">{loadError}</p>
          ) : references.length === 0 ? (
            <p className="text-sm text-[var(--foreground)]/50">
              {t.documents.references.empty}
            </p>
          ) : (
            references.map((reference) => (
              <div
                key={reference.id}
                className="rounded-xl border border-[var(--border)] p-3"
              >
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {reference.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--foreground)]/55">
                  <span>
                    {moduleLabels[reference.sourceModule] ?? reference.sourceModule}
                  </span>
                  <span>
                    {kindLabels[reference.referenceKind] ?? reference.referenceKind}
                  </span>
                  <span>
                    {t.documents.references.mentionedAt}: {formatDate(reference.mentionedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
