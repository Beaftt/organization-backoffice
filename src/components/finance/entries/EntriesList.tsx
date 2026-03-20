'use client';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/lib/i18n/language-context';
import { EntryRow } from './EntryRow';
import type { FinanceTransaction, FinanceCategory } from '@/lib/api/finance';

interface EntriesListProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  isLoading: boolean;
  hasMore: boolean;
  isSaving?: boolean;
  onEdit: (item: FinanceTransaction) => void;
  onDelete: (item: FinanceTransaction) => void;
  onLoadMore: () => void;
}

export function EntriesList({
  transactions,
  categories,
  isLoading,
  hasMore,
  isSaving,
  onEdit,
  onDelete,
  onLoadMore,
}: EntriesListProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed [border-color:var(--border)] px-4 py-10 text-center">
        <p className="text-sm font-semibold text-[var(--foreground)]/60">
          {t.finance.empty}
        </p>
        <p className="mt-1 text-xs text-[var(--foreground)]/40">
          {t.finance.entriesNoResults ?? 'Nenhuma transação encontrada com esses filtros.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {transactions.map((item, index) => {
        const category = categories.find((c) => c.id === item.categoryId);
        return (
          <EntryRow
            key={item.id}
            item={item}
            index={index}
            category={category}
            disabled={isSaving}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={onLoadMore}>
            {t.finance.loadMore}
          </Button>
        </div>
      ) : (
        <p className="pt-1 text-center text-xs text-[var(--foreground)]/40">
          {t.finance.entriesEnd ?? `${transactions.length} ${t.finance.entriesSummary?.replace('{n}', '').trim() ?? 'lançamentos total'}`}
        </p>
      )}
    </div>
  );
}
