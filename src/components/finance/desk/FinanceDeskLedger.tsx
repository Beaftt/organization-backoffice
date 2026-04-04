'use client';

import { EntriesList } from '@/components/finance/entries/EntriesList';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTransaction,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';

type FinanceDeskLedgerProps = {
  accountFilter: string;
  accounts: FinanceAccount[];
  activeId: string | null;
  cardFilter: string;
  cardMethods: FinancePaymentMethod[];
  categories: FinanceCategory[];
  groupFilter: string;
  hasMore: boolean;
  isLoading: boolean;
  isSaving: boolean;
  query: string;
  routeFilter: string;
  sortBy: string;
  statusFilter: string;
  totalTransactions: number;
  transactions: FinanceTransaction[];
  typeFilter: string;
  onAccount: (value: string) => void;
  onCard: (value: string) => void;
  onDelete: (item: FinanceTransaction) => void;
  onEdit: (item: FinanceTransaction) => void;
  onGroup: (value: string) => void;
  onLoadMore: () => void;
  onQuery: (value: string) => void;
  onRoute: (value: string) => void;
  onSort: (value: string) => void;
  onStatus: (value: string) => void;
  onType: (value: string) => void;
};

export function FinanceDeskLedger({
  accountFilter,
  accounts,
  activeId,
  cardFilter,
  cardMethods,
  categories,
  groupFilter,
  hasMore,
  isLoading,
  isSaving,
  query,
  routeFilter,
  sortBy,
  statusFilter,
  totalTransactions,
  transactions,
  typeFilter,
  onAccount,
  onCard,
  onDelete,
  onEdit,
  onGroup,
  onLoadMore,
  onQuery,
  onRoute,
  onSort,
  onStatus,
  onType,
}: FinanceDeskLedgerProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const searchPlaceholder = isPt ? 'Busque por nome ou nota' : 'Search by name or note';
  const routeLabel = isPt ? 'Rota' : 'Route';
  const cardLabel = isPt ? 'Cartão' : 'Card';
  const ledgerEyebrow = isPt ? 'Lançamentos do mês' : 'Month entries';
  const ledgerTitle = isPt ? 'Tudo do mês em uma lista' : 'Everything this month in one list';
  const totalLabel = isPt
    ? `${totalTransactions} lançamentos`
    : `${totalTransactions} entries`;
  const allFem = isPt ? 'Todas' : 'All';
  const allMasc = isPt ? 'Todos' : 'All';
  const routeOptions = [
    { value: 'all', label: allFem },
    { value: 'debit-pix', label: isPt ? 'Débito / Pix' : 'Debit / Pix' },
    { value: 'credit', label: isPt ? 'Crédito' : 'Credit' },
    { value: 'income', label: t.finance.groupIncome },
    { value: 'transfer', label: isPt ? 'Transferência' : 'Transfer' },
    {
      value: 'investment',
      label:
        t.finance.transactionTypeInvestment ??
        (isPt ? 'Investimento' : 'Investment'),
    },
  ];

  return (
    <Card className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b [border-color:var(--border)] pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
            {ledgerEyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            {ledgerTitle}
          </h2>
        </div>
        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/65">
          {totalLabel}
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_repeat(6,minmax(132px,1fr))]">
        <Input
          label={t.finance.searchLabel}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={searchPlaceholder}
        />

        {[
          {
            label: t.finance.groupLabel,
            value: groupFilter,
            onChange: onGroup,
            options: [
              { value: 'all', label: allMasc },
              { value: 'INCOME', label: t.finance.groupIncome },
              { value: 'EXPENSE', label: t.finance.groupExpense },
            ],
          },
          {
            label: t.finance.accountLabel,
            value: accountFilter,
            onChange: onAccount,
            options: [
              { value: 'all', label: allFem },
              ...accounts.map((account) => ({ value: account.id, label: account.name })),
            ],
          },
          {
            label: cardLabel,
            value: cardFilter,
            onChange: onCard,
            options: [
              { value: 'all', label: allMasc },
              ...cardMethods.map((card) => ({ value: card.id, label: card.name })),
            ],
          },
          {
            label: routeLabel,
            value: routeFilter,
            onChange: onRoute,
            options: routeOptions,
          },
          {
            label: t.finance.typeLabel,
            value: typeFilter,
            onChange: onType,
            options: [
              { value: 'all', label: allFem },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ],
          },
          {
            label: t.finance.statusLabel,
            value: statusFilter,
            onChange: onStatus,
            options: [
              { value: 'all', label: allMasc },
              { value: 'PAID', label: t.finance.statusPaid },
              { value: 'PENDING', label: t.finance.statusPending },
            ],
          },
          {
            label: t.finance.sortLabel,
            value: sortBy,
            onChange: onSort,
            options: [
              { value: 'date', label: t.finance.sortDate },
              { value: 'amount', label: t.finance.sortAmount },
            ],
          },
        ].map((filter) => (
          <label
            key={filter.label}
            className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70"
          >
            <span className="font-medium text-[var(--foreground)]/90">{filter.label}</span>
            <select
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
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
      </div>

      <EntriesList
        transactions={transactions}
        categories={categories}
        isLoading={isLoading}
        hasMore={hasMore}
        isSaving={isSaving}
        activeId={activeId}
        onEdit={onEdit}
        onDelete={onDelete}
        onLoadMore={onLoadMore}
      />
    </Card>
  );
}