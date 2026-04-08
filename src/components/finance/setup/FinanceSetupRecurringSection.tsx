'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  isFinanceRecurringCompletedForMonth,
  isFinanceRecurringToggleDisabled,
} from '@/lib/finance/finance-recurring-month-state';
import { buildRecurringProjectionSummary } from '@/lib/finance/finance-recurring-insights';
import { useLanguage } from '@/lib/i18n/language-context';
import { formatCurrencyForLanguage } from '@/lib/i18n/locale';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceRecurring,
} from '@/lib/api/finance';

type RecurringStatus = 'active' | 'paused' | 'needs-review';

type FinanceSetupRecurringSectionProps = {
  accounts: FinanceAccount[];
  paymentMethods: FinancePaymentMethod[];
  categories: FinanceCategory[];
  recurring: FinanceRecurring[];
  recurringStatus: (item: FinanceRecurring) => RecurringStatus;
  selectedYear: number;
  selectedMonth: number;
  isSaving: boolean;
  onAdd: () => void;
  onDelete: (item: FinanceRecurring) => void;
  onEdit: (item: FinanceRecurring) => void;
  onToggleActive: (item: FinanceRecurring) => void;
  onTogglePayment: (
    item: FinanceRecurring,
    paid: boolean,
    status?: 'PAID' | 'PENDING',
  ) => void;
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
  paymentMethods,
  categories,
  recurring,
  recurringStatus,
  selectedYear,
  selectedMonth,
  isSaving,
  onAdd,
  onDelete,
  onEdit,
  onToggleActive,
  onTogglePayment,
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
  const paymentMethodMap = useMemo(
    () => new Map(paymentMethods.map((paymentMethod) => [paymentMethod.id, paymentMethod.name])),
    [paymentMethods],
  );
  const paymentMethodTypeMap = useMemo(
    () => new Map(paymentMethods.map((paymentMethod) => [paymentMethod.id, paymentMethod.type])),
    [paymentMethods],
  );
  const [statusChoiceTargetId, setStatusChoiceTargetId] = useState<string | null>(null);
  const summary = useMemo(() => {
    const today = new Date();

    return buildRecurringProjectionSummary(
      recurring,
      [],
      today.getFullYear(),
      today.getMonth(),
    );
  }, [recurring]);
  const summaryCurrency = recurring.find((item) => item.active)?.currency ?? 'BRL';
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
  const noPaymentMethodLabel = language === 'pt' ? 'Sem método' : 'No method';
  const noCategoryLabel = language === 'pt' ? 'Sem categoria' : 'No category';
  const subscriptionLabel = t.finance.subscriptionBadge ?? (language === 'pt' ? 'Assinatura' : 'Subscription');
  const creditChoiceTitle = language === 'pt' ? 'Como deseja registrar esta cobrança?' : 'How do you want to register this charge?';
  const creditChoiceHint = language === 'pt' ? 'Para cartão de crédito, você pode lançar na fatura como pendente ou já marcar como pago.' : 'For credit cards, you can keep it pending on the bill or mark it as paid right away.';
  const paidChoiceLabel = language === 'pt' ? 'Registrar como pago' : 'Register as paid';
  const pendingChoiceLabel = language === 'pt' ? 'Registrar como pendente' : 'Register as pending';
  const groupLabel = (item: FinanceRecurring) => item.group === 'INCOME'
    ? t.finance.groupIncome
    : t.finance.groupExpense;
  const resolveToggleLabel = (item: FinanceRecurring, checked: boolean) => {
    if (checked) {
      return language === 'pt'
        ? `Desmarcar ${item.title} como paga`
        : `Mark ${item.title} as unpaid`;
    }

    return language === 'pt'
      ? `Marcar ${item.title} como paga`
      : `Mark ${item.title} as paid`;
  };
  const isCreditRecurring = (item: FinanceRecurring) =>
    item.paymentMethodId
      ? paymentMethodTypeMap.get(item.paymentMethodId) === 'CREDIT'
      : false;
  const handleTogglePaymentClick = (item: FinanceRecurring, checked: boolean) => {
    if (checked) {
      setStatusChoiceTargetId(null);
      onTogglePayment(item, false);
      return;
    }

    if (isCreditRecurring(item)) {
      setStatusChoiceTargetId((current) => (current === item.id ? null : item.id));
      return;
    }

    setStatusChoiceTargetId(null);
    onTogglePayment(item, true);
  };
  const handleSelectCreditStatus = (
    item: FinanceRecurring,
    status: 'PAID' | 'PENDING',
  ) => {
    setStatusChoiceTargetId(null);
    onTogglePayment(item, true, status);
  };

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
        <div className="space-y-4">
          {summary.activeCount > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border [border-color:var(--border)] bg-[var(--surface-muted)]/45 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
                  {t.finance.subscriptionSummaryActive ?? (language === 'pt' ? 'Ativas' : 'Active')}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{summary.activeCount}</p>
              </div>
              <div className="rounded-2xl border [border-color:var(--border)] bg-[var(--surface-muted)]/45 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
                  {t.finance.subscriptionCalendarTotal ?? (language === 'pt' ? 'Total do mês' : 'Month total')}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  {formatCurrencyForLanguage(language, summary.monthTotal, summaryCurrency)}
                </p>
              </div>
              <div className="rounded-2xl border [border-color:var(--border)] bg-[var(--surface-muted)]/45 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
                  {t.finance.subscriptionSummaryAnnual ?? (language === 'pt' ? 'Projeção anual' : 'Annual forecast')}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  {formatCurrencyForLanguage(language, summary.annualForecast, summaryCurrency)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border [border-color:var(--border)]">
          {recurring.map((item) => {
            const status = recurringStatus(item);
            const checked = isFinanceRecurringCompletedForMonth(
              item,
              selectedYear,
              selectedMonth,
            );
            const toggleDisabled = isFinanceRecurringToggleDisabled(item) || isSaving;
            const isChoosingCreditStatus = statusChoiceTargetId === item.id;
            const paymentMethodLabel = item.paymentMethodId
              ? paymentMethodMap.get(item.paymentMethodId) ?? noPaymentMethodLabel
              : null;
            return (
              <div key={item.id} className="border-b [border-color:var(--border)] last:border-b-0">
                <div className="grid gap-3 px-4 py-4 lg:grid-cols-[auto_1.5fr_1fr_1fr_auto] lg:items-center">
                  <div className="flex items-start lg:items-center">
                    <button
                      type="button"
                      aria-label={resolveToggleLabel(item, checked)}
                      aria-pressed={checked}
                      disabled={toggleDisabled}
                      onClick={() => handleTogglePaymentClick(item, checked)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                        checked
                          ? 'border-[var(--sidebar)] bg-[var(--sidebar)] text-white'
                          : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]/35'
                      } ${toggleDisabled ? 'cursor-not-allowed opacity-55' : 'hover:border-[var(--sidebar)]/55 hover:text-[var(--sidebar)]'}`}
                    >
                      {checked ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                      {item.isSubscription ? (
                        <span className="rounded-full border border-[var(--sidebar)]/20 bg-[var(--sidebar)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--sidebar)]">
                          {subscriptionLabel}
                        </span>
                      ) : null}
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClassName[status]}`}>
                        {status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--foreground)]/55">
                      {recurrenceLabel(item)} · {groupLabel(item)} · {formatDateLabel(item.nextDue)}
                    </p>
                    {paymentMethodLabel ? (
                      <p className="text-xs text-[var(--foreground)]/45">{paymentMethodLabel}</p>
                    ) : null}
                  </div>

                  <p className="text-xs text-[var(--foreground)]/60">
                    {accountMap.get(item.accountId ?? '') ?? noAccountLabel}
                  </p>

                  <p className="text-xs text-[var(--foreground)]/60">
                    {categoryMap.get(item.categoryId ?? '') ?? noCategoryLabel}
                  </p>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" onClick={() => onToggleActive(item)} disabled={isSaving}>
                      {item.active ? pauseLabel : resumeLabel}
                    </Button>
                    <Button variant="ghost" onClick={() => onEdit(item)} aria-label={t.finance.editAction} disabled={isSaving}>
                      {t.finance.editAction}
                    </Button>
                    <Button variant="ghost" onClick={() => onDelete(item)} aria-label={t.finance.deleteAction} disabled={isSaving}>
                      {t.finance.deleteAction}
                    </Button>
                  </div>
                </div>

                {isChoosingCreditStatus ? (
                  <div className="border-t [border-color:var(--border)] bg-[var(--surface-muted)]/35 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-xl">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{creditChoiceTitle}</p>
                        <p className="mt-1 text-xs text-[var(--foreground)]/58">{creditChoiceHint}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => handleSelectCreditStatus(item, 'PENDING')} disabled={isSaving}>
                          {pendingChoiceLabel}
                        </Button>
                        <Button onClick={() => handleSelectCreditStatus(item, 'PAID')} disabled={isSaving}>
                          {paidChoiceLabel}
                        </Button>
                        <Button variant="ghost" onClick={() => setStatusChoiceTargetId(null)} disabled={isSaving}>
                          {t.finance.cancel}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}