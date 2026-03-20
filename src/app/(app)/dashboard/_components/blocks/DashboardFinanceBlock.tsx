'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLanguage } from '@/lib/i18n/language-context';
import { FinanceStatCard } from '../cards/FinanceStatCard';
import type { DashboardFinanceSummary } from '../../types';

interface DashboardFinanceBlockProps {
  finance: DashboardFinanceSummary | null;
  isLoading: boolean;
  formatValue: (v: number) => string;
}

export function DashboardFinanceBlock({
  finance,
  isLoading,
  formatValue,
}: DashboardFinanceBlockProps) {
  const { t } = useLanguage();

  if (!isLoading && !finance) {
    return (
      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/50">
          {t.dashboard.summaryFinanceTitle}
        </p>
        <p className="text-sm text-[var(--foreground)]/40">{t.dashboard.financeEmpty}</p>
        <Link
          href="/finance"
          className="text-xs font-semibold text-[var(--sidebar)] underline-offset-2 hover:underline"
        >
          {t.dashboard.financeConfigureCta} →
        </Link>
      </Card>
    );
  }

  const expensePct =
    finance && finance.income > 0
      ? Math.min(100, (finance.expenses / finance.income) * 100)
      : 0;
  const savingsPct = finance && finance.income > 0 ? Math.max(0, 100 - expensePct) : 0;

  return (
    <Card className="flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/50">
          {t.dashboard.summaryFinanceTitle}
        </p>
        <Link
          href="/finance"
          className="text-xs font-semibold text-[var(--sidebar)] underline-offset-2 hover:underline"
        >
          {t.dashboard.financeViewDetails} →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b border-[var(--border)] pb-5">
        <FinanceStatCard
          label={t.dashboard.summaryFinanceIncome}
          value={finance?.income ?? 0}
          variant="income"
          isLoading={isLoading}
          formatValue={formatValue}
        />
        <FinanceStatCard
          label={t.dashboard.summaryFinanceExpense}
          value={finance?.expenses ?? 0}
          variant="expense"
          isLoading={isLoading}
          formatValue={formatValue}
        />
        <FinanceStatCard
          label={t.dashboard.financeNetResult}
          value={finance?.netResult ?? 0}
          variant="net"
          isLoading={isLoading}
          formatValue={formatValue}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex h-2 overflow-hidden rounded-full">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-full" />
          ) : (
            <>
              <div
                className="h-full bg-[var(--expense)] transition-all duration-500"
                style={{ width: `${expensePct}%` }}
              />
              <div
                className="h-full bg-[var(--income)] transition-all duration-500"
                style={{ width: `${savingsPct}%` }}
              />
            </>
          )}
        </div>
        <div className="flex justify-between text-xs text-[var(--foreground)]/50">
          <span>
            {t.dashboard.summaryFinanceExpense} {expensePct.toFixed(0)}%
          </span>
          <span className="font-semibold text-[var(--income)]">
            {t.dashboard.financeSavingsRate}: {savingsPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
