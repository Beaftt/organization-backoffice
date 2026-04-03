'use client';

import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceRecurring,
} from '@/lib/api/finance';

type RecurringStatus = 'active' | 'paused' | 'needs-review';

type FinanceSetupRecurringSectionProps = {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  recurring: FinanceRecurring[];
  recurringStatus: (item: FinanceRecurring) => RecurringStatus;
  onAdd: () => void;
  onDelete: (item: FinanceRecurring) => void;
  onEdit: (item: FinanceRecurring) => void;
  onToggleActive: (item: FinanceRecurring) => void;
};

const statusClassName: Record<RecurringStatus, string> = {
  active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  paused: 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]/65',
  'needs-review': 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function FinanceSetupRecurringSection({
  accounts,
  categories,
  recurring,
  recurringStatus,
  onAdd,
  onDelete,
  onEdit,
  onToggleActive,
}: FinanceSetupRecurringSectionProps) {
  const { language, t } = useLanguage();
  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const cadenceLabel = (item: FinanceRecurring) => {
    if (item.frequency === 'MONTHLY' && item.interval === 6) {
      return t.finance.cadenceSemiannual ?? (language === 'pt' ? 'Semestral' : 'Semiannual');
    }

    const base = {
      DAILY: t.finance.cadenceDaily ?? (language === 'pt' ? 'Diária' : 'Daily'),
      WEEKLY: t.finance.cadenceWeekly ?? (language === 'pt' ? 'Semanal' : 'Weekly'),
      MONTHLY: t.finance.cadenceMonthly ?? (language === 'pt' ? 'Mensal' : 'Monthly'),
      YEARLY: t.finance.cadenceYearly ?? (language === 'pt' ? 'Anual' : 'Yearly'),
    }[item.frequency];

    if (item.interval <= 1) {
      return base;
    }

    return language === 'pt'
      ? `${base} · a cada ${item.interval} ciclos`
      : `${base} · every ${item.interval} periods`;
  };
  const recurrenceLabel = (item: FinanceRecurring) => {
    const ending = item.endDate
      ? `${language === 'pt' ? ' · até ' : ' · until '}${formatDateLabel(item.endDate)}`
      : `${language === 'pt' ? ' · sem fim' : ' · no end date'}`;
    return `${cadenceLabel(item)}${ending}`;
  };
  const sectionEyebrow = language === 'pt' ? 'Programado' : 'Programmed';
  const sectionTitle = language === 'pt' ? 'Cobranças programadas' : 'Programmed charges';
  const sectionDescription = language === 'pt'
    ? 'Salário, assinaturas e cobranças com fim ou sem fim ficam aqui. Quando terminam, funcionam como séries planejadas; sem fim, seguem contínuas.'
    : 'Salary, subscriptions, and charges with or without an end live here. When they end, they behave like planned series; without an end, they stay ongoing.';
  const addLabel = language === 'pt' ? '+ Nova cobrança programada' : '+ New programmed charge';
  const pauseLabel = t.finance.pauseAction ?? (language === 'pt' ? 'Pausar' : 'Pause');
  const resumeLabel = t.finance.resumeAction ?? (language === 'pt' ? 'Retomar' : 'Resume');
  const noAccountLabel = language === 'pt' ? 'Sem conta' : 'No account';
  const noCategoryLabel = language === 'pt' ? 'Sem categoria' : 'No category';
  const groupLabel = (item: FinanceRecurring) => item.group === 'INCOME'
    ? t.finance.groupIncome
    : t.finance.groupExpense;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
            {sectionEyebrow}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            {sectionTitle}
          </h3>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            {sectionDescription}
          </p>
        </div>

        <Button onClick={onAdd}>{addLabel}</Button>
      </div>

      {recurring.length === 0 ? (
        <div className="rounded-2xl border border-dashed [border-color:var(--border)] px-5 py-6 text-sm text-[var(--foreground)]/60">
          {t.finance.empty ?? 'No recurring rules yet.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border [border-color:var(--border)]">
          {recurring.map((item) => {
            const status = recurringStatus(item);
            return (
              <div
                key={item.id}
                className="grid gap-3 border-b [border-color:var(--border)] px-4 py-4 last:border-b-0 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClassName[status]}`}>
                      {status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground)]/55">
                    {recurrenceLabel(item)} · {groupLabel(item)} · {formatDateLabel(item.nextDue)}
                  </p>
                </div>

                <p className="text-xs text-[var(--foreground)]/60">
                  {accountMap.get(item.accountId ?? '') ?? noAccountLabel}
                </p>

                <p className="text-xs text-[var(--foreground)]/60">
                  {categoryMap.get(item.categoryId ?? '') ?? noCategoryLabel}
                </p>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="ghost" onClick={() => onToggleActive(item)}>
                    {item.active ? pauseLabel : resumeLabel}
                  </Button>
                  <Button variant="ghost" onClick={() => onEdit(item)} aria-label={t.finance.editAction}>
                    {t.finance.editAction}
                  </Button>
                  <Button variant="ghost" onClick={() => onDelete(item)} aria-label={t.finance.deleteAction}>
                    {t.finance.deleteAction}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}