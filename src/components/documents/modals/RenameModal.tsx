'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Props = {
  isOpen: boolean;
  title: string;
  value: string;
  error: string | null;
  isSaving: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function RenameModal({
  isOpen,
  title,
  value,
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
      <div className="w-full max-w-sm rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title || t.documents.renameTitle}</h3>
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t.documents.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t.documents.saving : t.documents.renameConfirm}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
