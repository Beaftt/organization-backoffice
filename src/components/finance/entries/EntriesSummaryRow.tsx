'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';

interface EntriesSummaryRowProps {
  total: number;
  totalIncome: number;
  totalExpense: number;
  currency?: string;
}

export function EntriesSummaryRow({
  total,
  totalIncome,
  totalExpense,
  currency = 'BRL',
}: EntriesSummaryRowProps) {
  const { t } = useLanguage();
  const net = totalIncome - totalExpense;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border [border-color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
      <span className="flex items-center gap-1.5 text-[var(--foreground)]/60">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="font-semibold">{total}</span>
        <span className="text-[var(--foreground)]/50">
          {(t.finance.entriesSummary ?? '{n} lançamentos').replace('{n}', '').trim() || 'lançamentos'}
        </span>
      </span>

      <span className="flex items-center gap-1 font-semibold text-[var(--income)]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
        {formatCurrency(totalIncome, currency)}
      </span>

      <span className="flex items-center gap-1 font-semibold text-[var(--expense)]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        {formatCurrency(totalExpense, currency)}
      </span>

      <span
        className={`ml-auto flex items-center gap-1 font-bold ${
          net >= 0 ? 'text-[var(--income)]' : 'text-[var(--expense)]'
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="5 7 12 7 12 17 19 17" />
        </svg>
        {formatCurrency(Math.abs(net), currency)}
      </span>
    </div>
  );
}
