'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/lib/i18n/language-context';
import type { SecretSummary } from '../types';
import { SecretRow } from './SecretRow';
import { SecretsEmptyState } from './SecretsEmptyState';
import { SecretsPagination } from './SecretsPagination';

const PAGE_SIZE = 6;

interface SecretsTableProps {
  records: SecretSummary[];
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  hasSearch: boolean;
  onView: (item: SecretSummary) => void;
  onEdit: (item: SecretSummary) => void;
  onDelete: (item: SecretSummary) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function SecretsTable({
  records,
  total,
  page,
  isLoading,
  error,
  hasSearch,
  onView,
  onEdit,
  onDelete,
  onPrevPage,
  onNextPage,
}: SecretsTableProps) {
  const { t } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/60">
              <th className="py-2.5 pl-5 pr-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                #
              </th>
              <th className="py-2.5 pr-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                {t.secrets?.tableTitle ?? 'Título'}
              </th>
              <th className="py-2.5 pr-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                {t.secrets?.tableUser ?? 'Segredo'}
              </th>
              <th className="py-2.5 pr-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                {t.secrets?.tableType ?? 'Tipo'}
              </th>
              <th className="py-2.5 pr-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                {t.secrets?.tableUpdated ?? 'Atualizado'}
              </th>
              <th className="py-2.5 pl-2 pr-5 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                {t.secrets?.tableActions ?? 'Ações'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--surface)]">
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 pl-5 pr-2"><Skeleton className="h-3 w-4" /></td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </td>
                  <td className="py-3 pr-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-3 w-20" /></td>
                  <td className="py-3 pl-2 pr-5 text-right"><Skeleton className="ml-auto h-6 w-20 rounded-lg" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-red-500">{error}</td>
              </tr>
            ) : records.length === 0 ? (
              <SecretsEmptyState hasSearch={hasSearch} />
            ) : (
              records.map((item, i) => (
                <SecretRow
                  key={item.id}
                  item={item}
                  index={(page - 1) * PAGE_SIZE + i}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <SecretsPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPrev={onPrevPage}
        onNext={onNextPage}
      />
    </div>
  );
}
