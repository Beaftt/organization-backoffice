'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import type { DocumentFolder, DocumentSummary } from '../types';

type Props = {
  isOpen: boolean;
  document: DocumentSummary | null;
  folders: DocumentFolder[];
  folderPaths: Record<string, string>;
  targetFolderId: string;
  error: string | null;
  isMoving: boolean;
  onTargetChange: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function MoveFolderModal({
  isOpen,
  document: doc,
  folders,
  folderPaths,
  targetFolderId,
  error,
  isMoving,
  onTargetChange,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useLanguage();

  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.documents.moveTitle}</h3>
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
          {doc.name}
        </p>

        <div className="mt-6">
          <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            {t.documents.moveLabel}
            <select
              value={targetFolderId}
              onChange={(e) => onTargetChange(e.target.value)}
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
        </div>

        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.documents.cancel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isMoving}>
            {isMoving ? t.documents.saving : t.documents.moveConfirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
