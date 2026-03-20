'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';
import type { FinanceTransaction, FinanceCategory } from '@/lib/api/finance';

interface FinanceCategoriesPanelProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
}

export function FinanceCategoriesPanel({ transactions, categories }: FinanceCategoriesPanelProps) {
  const { t } = useLanguage();

  const topCategories = useMemo(() => {
    const expense = transactions.filter((tx) => tx.group === 'EXPENSE' && tx.categoryId);
    const totals: Record<string, number> = {};
    for (const tx of expense) {
      const id = tx.categoryId!;
      totals[id] = (totals[id] ?? 0) + tx.amount;
    }
    const max = Math.max(...Object.values(totals), 1);
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, total]) => ({
        id,
        name: categories.find((c) => c.id === id)?.name ?? id,
        total,
        pct: Math.round((total / max) * 100),
      }));
  }, [transactions, categories]);

  return (
    <div className="rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] p-5">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/50">
        {t.finance.topCategoriesTitle}
      </p>
      {topCategories.length === 0 ? (
        <p className="text-sm text-[var(--foreground)]/40">{t.finance.empty}</p>
      ) : (
        <div className="grid gap-3">
          {topCategories.map((cat) => (
            <div key={cat.id} className="grid gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--foreground)]/70">{cat.name}</span>
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {formatCurrency(cat.total, 'BRL')}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--expense)]"
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
