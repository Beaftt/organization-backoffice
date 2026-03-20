'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';

interface StatCardProps {
  label: string;
  value: number;
  currency?: string;
  badge?: string;
  colorClass?: string;
}

function FinanceStatCard({ label, value, currency = 'BRL', badge, colorClass = '' }: StatCardProps) {
  const formatted = formatCurrency(value, currency);
  return (
    <div className="soft-transition rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm hover:[border-color:var(--sidebar)] transition-colors">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]/50">
          {label}
        </p>
        {badge ? (
          <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--foreground)]/60">
            {badge}
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-2xl font-extrabold tracking-tight ${colorClass}`}>{formatted}</p>
    </div>
  );
}

interface FinanceStatsRowProps {
  totalIncome: number;
  totalExpense: number;
  investmentsTotal: number;
  investmentsCount: number;
  currency?: string;
}

export function FinanceStatsRow({
  totalIncome,
  totalExpense,
  investmentsTotal,
  investmentsCount,
  currency = 'BRL',
}: FinanceStatsRowProps) {
  const { t } = useLanguage();
  const net = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((net / totalIncome) * 100).toFixed(1) : '0';
  const expensesRate = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <FinanceStatCard
        label={t.finance.summaryIncome}
        value={totalIncome}
        currency={currency}
        badge={t.finance.statsMonthBadge}
        colorClass="text-[var(--income)]"
      />
      <FinanceStatCard
        label={t.finance.summaryExpense}
        value={totalExpense}
        currency={currency}
        badge={(t.finance.statsExpensesRate ?? '{rate}% da receita').replace('{rate}', expensesRate)}
        colorClass="text-[var(--expense)]"
      />
      <FinanceStatCard
        label={t.finance.summaryNet}
        value={net}
        currency={currency}
        badge={`↑ ${savingsRate}%`}
        colorClass={net >= 0 ? 'text-[var(--income)]' : 'text-[var(--expense)]'}
      />
      <FinanceStatCard
        label={t.finance.investmentsTitle ?? 'Investimentos'}
        value={investmentsTotal}
        currency={currency}
        badge={(t.finance.statsPortfolios ?? '{n} carteiras ativas').replace('{n}', String(investmentsCount))}
        colorClass="text-[var(--sidebar)]"
      />
    </div>
  );
}
