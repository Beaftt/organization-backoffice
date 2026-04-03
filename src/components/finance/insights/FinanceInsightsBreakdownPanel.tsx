'use client';

import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';

type InsightBreakdownItem = {
  id: string;
  label: string;
  amount: number;
  count: number;
};

type FinanceInsightsBreakdownPanelProps = {
  description: string;
  emptyLabel: string;
  eyebrow: string;
  items: InsightBreakdownItem[];
  title: string;
  onOpenEvidence: (item: InsightBreakdownItem) => void;
};

export function FinanceInsightsBreakdownPanel({
  description,
  emptyLabel,
  eyebrow,
  items,
  title,
  onOpenEvidence,
}: FinanceInsightsBreakdownPanelProps) {
  const { language } = useLanguage();
  const isPt = language === 'pt';
  const maxAmount = Math.max(...items.map((item) => Math.abs(item.amount)), 1);
  const evidenceLabel = isPt ? 'Ver itens' : 'View entries';

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/62">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed [border-color:var(--border)] px-4 py-6 text-sm text-[var(--foreground)]/58">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                  <p className="mt-1 text-xs text-[var(--foreground)]/55">
                    {isPt ? `${item.count} lançamentos no período` : `${item.count} entries in this period`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenEvidence(item)}
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/72 transition-colors hover:bg-[var(--surface)]"
                >
                  {evidenceLabel}
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                <div className="h-2 rounded-full bg-[var(--surface)]">
                  <div
                    className="chart-bar h-2 rounded-full bg-[var(--sidebar)]"
                    style={{ width: `${(Math.abs(item.amount) / maxAmount) * 100}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {formatCurrency(Math.abs(item.amount), 'BRL')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}