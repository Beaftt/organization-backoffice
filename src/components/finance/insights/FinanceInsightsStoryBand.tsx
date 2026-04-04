'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrencyForLanguage } from '@/lib/i18n/locale';

type FinanceInsightsStoryBandProps = {
  isCurrentMonth: boolean;
  monthLabel: string;
  totalExpense: number;
  totalIncome: number;
  onMonthNext: () => void;
  onMonthPrev: () => void;
  onMonthReset: () => void;
};

export function FinanceInsightsStoryBand({
  isCurrentMonth,
  monthLabel,
  totalExpense,
  totalIncome,
  onMonthNext,
  onMonthPrev,
  onMonthReset,
}: FinanceInsightsStoryBandProps) {
  const { language } = useLanguage();
  const isPt = language === 'pt';
  const net = totalIncome - totalExpense;
  const eyebrowLabel = isPt ? 'Análises financeiras' : 'Finance insights';
  const tone = net >= 0
    ? isPt ? 'terminou no azul' : 'ended positive'
    : isPt ? 'terminou apertado' : 'ended tight';
  const monthPrevLabel = isPt ? 'Mês anterior' : 'Previous month';
  const monthNextLabel = isPt ? 'Próximo mês' : 'Next month';
  const todayLabel = isPt ? 'Hoje' : 'Today';
  const summary = isPt
    ? `O mês ${tone}: entraram ${formatCurrencyForLanguage(language, totalIncome, 'BRL')}, saíram ${formatCurrencyForLanguage(language, totalExpense, 'BRL')} e o saldo fechou em ${formatCurrencyForLanguage(language, net, 'BRL')}.`
    : `The month ${tone}: ${formatCurrencyForLanguage(language, totalIncome, 'BRL')} came in, ${formatCurrencyForLanguage(language, totalExpense, 'BRL')} went out, and the balance closed at ${formatCurrencyForLanguage(language, net, 'BRL')}.`;

  return (
    <Card className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-end">
      <div className="grid gap-3">
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
        <p className="max-w-2xl text-base leading-7 text-[var(--foreground)]/68">
          {summary}
        </p>
      </div>

      <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
        <Button variant="secondary" onClick={onMonthPrev}>
          {monthPrevLabel}
        </Button>
        <Button variant="secondary" onClick={onMonthNext}>
          {monthNextLabel}
        </Button>
      </div>
    </Card>
  );
}