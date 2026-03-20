'use client';

import { useLanguage } from '@/lib/i18n/language-context';

interface SecretsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
}

export function SecretsPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPrev,
  onNext,
}: SecretsPaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
      <span className="text-xs text-[var(--foreground)]/50">
        {t.secrets?.showing
          ? t.secrets.showing.replace('{{from}}', String(from)).replace('{{to}}', String(to)).replace('{{total}}', String(total))
          : `${from}–${to} de ${total}`
        }
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={onPrev}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← {t.secrets?.previous ?? 'Anterior'}
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={onNext}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/60 transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.secrets?.next ?? 'Próximo'} →
        </button>
      </div>
    </div>
  );
}
