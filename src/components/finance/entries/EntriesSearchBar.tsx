'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceCategory } from '@/lib/api/finance';

interface EntriesSearchBarProps {
  query: string;
  groupFilter: string;
  typeFilter: string;
  statusFilter: string;
  sortBy: string;
  categories: FinanceCategory[];
  onQuery: (value: string) => void;
  onGroup: (value: string) => void;
  onType: (value: string) => void;
  onStatus: (value: string) => void;
  onSort: (value: string) => void;
  onNew: () => void;
}

export function EntriesSearchBar({
  query,
  groupFilter,
  typeFilter,
  statusFilter,
  sortBy,
  categories,
  onQuery,
  onGroup,
  onType,
  onStatus,
  onSort,
  onNew,
}: EntriesSearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border [border-color:var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="min-w-[200px] flex-1">
        <Input
          label={t.finance.searchLabel}
          placeholder={t.finance.searchPlaceholder}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
        {t.finance.groupLabel}
        <select
          value={groupFilter}
          onChange={(e) => onGroup(e.target.value)}
          className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
        >
          <option value="all">{t.finance.groupAll}</option>
          <option value="INCOME">{t.finance.groupIncome}</option>
          <option value="EXPENSE">{t.finance.groupExpense}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
        {t.finance.typeLabel}
        <select
          value={typeFilter}
          onChange={(e) => onType(e.target.value)}
          className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
        >
          <option value="all">{t.finance.typeAll}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
        {t.finance.statusLabel}
        <select
          value={statusFilter}
          onChange={(e) => onStatus(e.target.value)}
          className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
        >
          <option value="all">{t.finance.statusAll}</option>
          <option value="PAID">{t.finance.statusPaid}</option>
          <option value="PENDING">{t.finance.statusPending}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
        {t.finance.sortLabel}
        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)]"
        >
          <option value="date">{t.finance.sortDate}</option>
          <option value="amount">{t.finance.sortAmount}</option>
        </select>
      </label>

      <Button onClick={onNew} className="shrink-0 self-end">
        {t.finance.newTransaction}
      </Button>
    </div>
  );
}
