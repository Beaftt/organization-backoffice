'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/Button';

type Props = {
  onUpload: () => void;
};

export function FilesEmptyState({ onUpload }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-muted)]">
        <svg
          className="h-8 w-8 text-[var(--foreground)]/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="14 2 14 8 20 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="font-medium text-[var(--foreground)]">
          {t.documents.emptyTitle}
        </p>
        <p className="mt-1 text-sm text-[var(--foreground)]/50">
          {t.documents.emptySubtitle}
        </p>
      </div>
      <Button variant="primary" onClick={onUpload}>
        {t.documents.uploadFile}
      </Button>
    </div>
  );
}
