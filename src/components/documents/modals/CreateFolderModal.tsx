'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { DocumentFolder } from '../types';

type FolderForm = { name: string; description: string; parentId: string };

type Props = {
  isOpen: boolean;
  form: FolderForm;
  folders: DocumentFolder[];
  folderPaths: Record<string, string>;
  error: string | null;
  isSaving: boolean;
  onChange: (form: FolderForm) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function CreateFolderModal({
  isOpen,
  form,
  folders,
  folderPaths,
  error,
  isSaving,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.documents.folderTitle}</h3>
          <button
            className="text-zinc-500 hover:text-zinc-700"
            onClick={onClose}
            type="button"
            aria-label={t.documents.cancel}
          >
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label={t.documents.folderNameLabel}
            placeholder={t.documents.folderNamePlaceholder}
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />

          <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            {t.documents.folderDescriptionLabel}
            <textarea
              className="min-h-[80px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
              value={form.description}
              onChange={(e) =>
                onChange({ ...form, description: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            {t.documents.folderParentLabel}
            <select
              value={form.parentId}
              onChange={(e) => onChange({ ...form, parentId: e.target.value })}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="">{t.documents.folderRoot}</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folderPaths[folder.id] ?? folder.name}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t.documents.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t.documents.saving : t.documents.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
