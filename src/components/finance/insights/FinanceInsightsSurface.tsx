'use client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrency } from '@/lib/utils/currency';

import { FinanceInsightsBreakdownPanel } from './FinanceInsightsBreakdownPanel';
import { FinanceInsightsEvidenceDrawer } from './FinanceInsightsEvidenceDrawer';
import { FinanceInsightsStoryBand } from './FinanceInsightsStoryBand';
import { useFinanceInsightsState } from './useFinanceInsightsState';

type FinanceInsightsSurfaceProps = {
  insights: ReturnType<typeof useFinanceInsightsState>;
};

export function FinanceInsightsSurface({ insights }: FinanceInsightsSurfaceProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const searchPlaceholder = isPt ? 'Busque por nome ou nota' : 'Search by name or note';
  const cardLabel = isPt ? 'Cartão' : 'Card';
  const routeLabel = isPt ? 'Rota' : 'Route';
  const allFem = isPt ? 'Todas' : 'All';
  const allMasc = isPt ? 'Todos' : 'All';
  const routeOptions = [
    { value: 'all', label: allFem },
    { value: 'debit-pix', label: isPt ? 'Débito / Pix' : 'Debit / Pix' },
    { value: 'credit', label: isPt ? 'Crédito' : 'Credit' },
    { value: 'income', label: t.finance.groupIncome },
    { value: 'transfer', label: isPt ? 'Transferência' : 'Transfer' },
    { value: 'investment', label: t.finance.transactionTypeInvestment ?? (isPt ? 'Investimento' : 'Investment') },
  ];
  const categoryPanel = isPt
    ? {
        eyebrow: 'Categorias',
        title: 'Para onde o dinheiro foi',
        description: 'Veja primeiro o que mais puxou o mês.',
        empty: 'Sem despesas categorizadas neste período.',
      }
    : {
        eyebrow: 'Categories',
        title: 'Where the money went',
        description: 'Start with what pulled the month the most.',
        empty: 'No categorized expenses in this period.',
      };
  const routePanel = isPt
    ? {
        eyebrow: 'Rotas do mês',
        title: 'Como o dinheiro andou',
        description: 'Separe o que saiu na hora, foi para o crédito, entrou ou virou investimento.',
        empty: 'Sem movimentos suficientes para esta leitura.',
      }
    : {
        eyebrow: 'Month routes',
        title: 'How the money moved',
        description: 'Split what left right away, went to credit, came in, or moved through investments.',
        empty: 'Not enough movement for this read.',
      };
  const creditEyebrow = isPt ? 'Crédito' : 'Credit';
  const creditTitle = isPt ? 'Crédito no mês' : 'Credit this month';
  const creditDescription = isPt
    ? `O crédito somou ${formatCurrency(insights.creditBurden.totalCredit, 'BRL')} em ${insights.creditBurden.cardsUsedCount} cartão${insights.creditBurden.cardsUsedCount === 1 ? '' : 'ões'} neste período.${insights.creditBurden.totalRemaining > 0 ? ` Ainda há ${formatCurrency(insights.creditBurden.totalRemaining, 'BRL')} em aberto.` : ''}`
    : `Credit added up to ${formatCurrency(insights.creditBurden.totalCredit, 'BRL')} across ${insights.creditBurden.cardsUsedCount} card${insights.creditBurden.cardsUsedCount === 1 ? '' : 's'} in this period.${insights.creditBurden.totalRemaining > 0 ? ` ${formatCurrency(insights.creditBurden.totalRemaining, 'BRL')} is still open.` : ''}`;
  const evidenceLabel = isPt ? 'Ver itens' : 'View entries';
  const recurringCards = isPt
    ? [
        {
          id: 'recurring',
          title: 'Programado',
          amount: insights.recurringBreakdown.recurringAmount,
          description: 'O que ja chega previsto no mês.',
        },
        {
          id: 'discretionary',
          title: 'Fora da rotina',
          amount: insights.recurringBreakdown.discretionaryAmount,
          description: 'O que dependeu de decisão neste período.',
        },
      ]
    : [
        {
          id: 'recurring',
          title: 'Planned',
          amount: insights.recurringBreakdown.recurringAmount,
          description: 'What already arrives expected in the month.',
        },
        {
          id: 'discretionary',
          title: 'Out of routine',
          amount: insights.recurringBreakdown.discretionaryAmount,
          description: 'What depended on a decision in this period.',
        },
      ];
  const accountPanel = isPt
    ? {
        eyebrow: 'Contas',
        title: 'Movimento por conta',
        description: 'Veja onde pesou mais, onde entrou folego e onde o fluxo se concentrou.',
        empty: 'Sem movimento por conta neste período.',
      }
    : {
        eyebrow: 'Accounts',
        title: 'Movement by account',
        description: 'See where the month weighed more, where there was relief, and where flow concentrated.',
        empty: 'No account movement in this period.',
      };
  const evidenceTitle = isPt ? 'Itens do recorte' : 'Entries in this cut';

  return (
    <div className="page-transition space-y-5">
      <FinanceInsightsStoryBand
        isCurrentMonth={insights.isCurrentMonth}
        monthLabel={insights.monthLabel}
        totalExpense={insights.totalExpense}
        totalIncome={insights.totalIncome}
        onMonthNext={insights.handleMonthNext}
        onMonthPrev={insights.handleMonthPrev}
        onMonthReset={insights.handleMonthReset}
      />

      {insights.error ? (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-200">
          {insights.error}
        </Card>
      ) : null}

      <Card className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(132px,1fr))]">
        <Input
          label={t.finance.searchLabel}
          value={insights.query}
          onChange={(event) => {
            insights.setQuery(event.target.value);
            insights.setPage(1);
          }}
          placeholder={searchPlaceholder}
        />

        {[
          {
            label: t.finance.accountLabel,
            value: insights.accountFilter,
            onChange: insights.setAccountFilter,
            options: [
              { value: 'all', label: allFem },
              ...insights.accounts.map((account) => ({ value: account.id, label: account.name })),
            ],
          },
          {
            label: cardLabel,
            value: insights.cardFilter,
            onChange: insights.setCardFilter,
            options: [
              { value: 'all', label: allMasc },
              ...insights.paymentMethods
                .filter((method) => method.type === 'CREDIT')
                .map((card) => ({ value: card.id, label: card.name })),
            ],
          },
          {
            label: routeLabel,
            value: insights.routeFilter,
            onChange: insights.setRouteFilter,
            options: routeOptions,
          },
          {
            label: t.finance.typeLabel,
            value: insights.typeFilter,
            onChange: insights.setTypeFilter,
            options: [
              { value: 'all', label: allFem },
              ...insights.categories.map((category) => ({ value: category.id, label: category.name })),
            ],
          },
          {
            label: t.finance.statusLabel,
            value: insights.statusFilter,
            onChange: insights.setStatusFilter,
            options: [
              { value: 'all', label: allMasc },
              { value: 'PAID', label: t.finance.statusPaid },
              { value: 'PENDING', label: t.finance.statusPending },
            ],
          },
        ].map((filter) => (
          <label key={filter.label} className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
            <span className="font-medium text-[var(--foreground)]/90">{filter.label}</span>
            <select
              value={filter.value}
              onChange={(event) => {
                filter.onChange(event.target.value);
                insights.setPage(1);
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </Card>

      <FinanceInsightsBreakdownPanel
        eyebrow={categoryPanel.eyebrow}
        title={categoryPanel.title}
        description={categoryPanel.description}
        emptyLabel={categoryPanel.empty}
        items={insights.categoryBreakdown}
        onOpenEvidence={(item) => insights.openCategoryEvidence(item.id, item.label)}
      />

      <FinanceInsightsBreakdownPanel
        eyebrow={routePanel.eyebrow}
        title={routePanel.title}
        description={routePanel.description}
        emptyLabel={routePanel.empty}
        items={insights.routeBreakdown}
        onOpenEvidence={(item) => insights.openRouteEvidence(item.id, item.label)}
      />

      <Card className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
            {creditEyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{creditTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/62">
            {creditDescription}
          </p>
        </div>
        <button
          type="button"
          onClick={insights.openCreditEvidence}
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/72 transition-colors hover:bg-[var(--surface-muted)]"
        >
          {evidenceLabel}
        </button>
      </Card>

      <Card className="grid gap-4 lg:grid-cols-2">
        {recurringCards.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => insights.openRecurringEvidence(item.id as 'recurring' | 'discretionary')}
            className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)]/45 px-4 py-5 text-left transition-colors hover:bg-[var(--surface-muted)]"
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
            <p className="mt-3 text-xl font-semibold text-[var(--foreground)]">
              {formatCurrency(item.amount, 'BRL')}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/58">{item.description}</p>
          </button>
        ))}
      </Card>

      <FinanceInsightsBreakdownPanel
        eyebrow={accountPanel.eyebrow}
        title={accountPanel.title}
        description={accountPanel.description}
        emptyLabel={accountPanel.empty}
        items={insights.accountMovement}
        onOpenEvidence={(item) => insights.openAccountEvidence(item.id, item.label)}
      />

      <FinanceInsightsEvidenceDrawer
        deskHref={insights.evidence?.deskHref ?? '/finance/desk'}
        description={insights.evidence?.description ?? ''}
        open={Boolean(insights.evidence)}
        title={insights.evidence?.title ?? evidenceTitle}
        transactions={insights.evidenceTransactions}
        onClose={insights.closeEvidence}
      />
    </div>
  );
}