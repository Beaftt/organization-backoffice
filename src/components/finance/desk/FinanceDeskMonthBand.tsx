'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrencyForLanguage } from '@/lib/i18n/locale';

type FinanceDeskMonthBandProps = {
  hasInvestments: boolean;
  isCurrentMonth: boolean;
  monthLabel: string;
  onOpenDeposit: () => void;
  totalExpense: number;
  totalIncome: number;
  onMonthNext: () => void;
  onMonthPrev: () => void;
  onMonthReset: () => void;
  onOpenComposer: () => void;
  onOpenWithdraw: () => void;
};

export function FinanceDeskMonthBand({
  hasInvestments,
  isCurrentMonth,
  monthLabel,
  onOpenDeposit,
  totalExpense,
  totalIncome,
  onMonthNext,
  onMonthPrev,
  onMonthReset,
  onOpenComposer,
  onOpenWithdraw,
}: FinanceDeskMonthBandProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const net = totalIncome - totalExpense;
  const eyebrowLabel = isPt ? 'Painel financeiro' : 'Finance desk';
  const intro = isPt
    ? 'Veja o mês em uma linha: registrar rápido, revisar o que saiu e mover dinheiro quando precisar.'
    : 'See the month in one line: capture fast, review what moved, and shift money when needed.';
  const monthPrevLabel = isPt ? 'Mês anterior' : 'Previous month';
  const monthNextLabel = isPt ? 'Próximo mês' : 'Next month';
  const todayLabel = isPt ? 'Hoje' : 'Today';
  const expenseLabel = isPt ? 'Gasto do mês' : 'Month spend';
  const incomeLabel = isPt ? 'Receita do mês' : 'Month income';
  const balanceLabel = isPt ? 'Saldo do mês' : 'Month balance';

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
                {eyebrowLabel}
            </p>
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-[var(--foreground)]">
                {monthLabel}
              </h1>
              {!isCurrentMonth ? (
                <button
                  type="button"
                  onClick={onMonthReset}
                  className="rounded-full bg-[var(--sidebar)] px-3 py-1.5 text-xs font-semibold text-[var(--sidebar-text)]"
                >
                  {todayLabel}
                </button>
              ) : null}
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[var(--foreground)]/62">
              {intro}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onMonthPrev} aria-label={monthPrevLabel}>
              {monthPrevLabel}
            </Button>
            <Button variant="secondary" onClick={onMonthNext} aria-label={monthNextLabel}>
              {monthNextLabel}
            </Button>
            <Button onClick={onOpenComposer}>{t.finance.newTransaction}</Button>
            {hasInvestments ? (
              <>
                <Button variant="secondary" onClick={onOpenDeposit}>
                  {isPt ? 'Aplicar' : 'Invest'}
                </Button>
                <Button variant="secondary" onClick={onOpenWithdraw}>
                  {t.finance.investWithdraw ?? (isPt ? 'Resgatar' : 'Withdraw')}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {[
            {
              label: expenseLabel,
              value: formatCurrencyForLanguage(language, totalExpense, 'BRL'),
            },
            {
              label: incomeLabel,
              value: formatCurrencyForLanguage(language, totalIncome, 'BRL'),
            },
            {
              label: balanceLabel,
              value: formatCurrencyForLanguage(language, net, 'BRL'),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)]/55 px-4 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
                {item.label}
              </p>
              <p className="mt-3 text-xl font-semibold text-[var(--foreground)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}