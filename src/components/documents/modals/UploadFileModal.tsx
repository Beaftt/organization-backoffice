'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileDropzone } from '../shared/FileDropzone';
import { detectDocumentType } from '../types';
import type { DocumentFolder, DocumentType } from '../types';

type UploadForm = {
  file: File | null;
  name: string;
  type: DocumentType;
  folderId: string;
  tags: string;
  description: string;
};

type Props = {
  isOpen: boolean;
  form: UploadForm;
  folders: DocumentFolder[];
  folderPaths: Record<string, string>;
  error: string | null;
  isUploading: boolean;
  onChange: (form: UploadForm) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function UploadFileModal({
  isOpen,
  form,
  folders,
  folderPaths,
  error,
  isUploading,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    onChange({
      ...form,
      file,
      name: form.name || file.name,
      type: detectDocumentType(file.name),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.documents.uploadTitle}</h3>
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
          <FileDropzone onFile={handleFile} />
          {form.file ? (
            <p className="text-sm text-[var(--foreground)]/60">
              📎 {form.file.name}
            </p>
          ) : null}

          <Input
            label={t.documents.fileNameLabel}
            placeholder={t.documents.fileNamePlaceholder}
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
          />

          <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            {t.documents.typeLabel}
            <select
              value={form.type}
              onChange={(e) =>
                onChange({ ...form, type: e.target.value as DocumentType })
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="PDF">{t.documents.typePdf}</option>
              <option value="IMAGE">{t.documents.typeImage}</option>
              <option value="SPREADSHEET">{t.documents.typeSpreadsheet}</option>
              <option value="OTHER">{t.documents.typeOther}</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            {t.documents.folderLabel}
            <select
              value={form.folderId}
              onChange={(e) => onChange({ ...form, folderId: e.target.value })}
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

          <Input
            label={t.documents.tagsLabel}
            placeholder={t.documents.tagsPlaceholder}
            value={form.tags}
            onChange={(e) => onChange({ ...form, tags: e.target.value })}
          />

          <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            {t.documents.descriptionLabel}
            <textarea
              className="min-h-[80px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-zinc-400"
              value={form.description}
              onChange={(e) =>
                onChange({ ...form, description: e.target.value })
              }
            />
          </label>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t.documents.cancel}
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? t.documents.saving : t.documents.uploadAction}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
