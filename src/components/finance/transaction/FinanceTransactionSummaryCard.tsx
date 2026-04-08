'use client';

import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  formatCurrencyForLanguage,
  getLocaleForLanguage,
} from '@/lib/i18n/locale';

import { parseCurrencyInput } from './transaction-editor-model';
import type { FinanceTransactionComposerForm } from './transaction-composer-model';

type FinanceTransactionSummaryCardProps = {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  form: FinanceTransactionComposerForm;
  paymentMethods: FinancePaymentMethod[];
};

export function FinanceTransactionSummaryCard({
  accounts,
  categories,
  form,
  paymentMethods,
}: FinanceTransactionSummaryCardProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const amount = parseCurrencyInput(form.amount);
  const account =
    accounts.find((item) => item.id === form.accountId)?.name ??
    (isPt ? 'Sem conta' : 'No account');
  const category =
    categories.find((item) => item.id === form.categoryId)?.name ??
    (isPt ? 'Sem categoria' : 'No category');
  const paymentMethod =
    paymentMethods.find((item) => item.id === form.paymentMethodId)?.name ??
    (form.immediateBehavior === 'BALANCE'
      ? isPt
        ? 'Saldo da conta'
        : 'Account balance'
      : isPt
        ? 'Sem método'
        : 'No method');
  const routeLabel =
    form.intent === 'credit'
      ? isPt
        ? 'Crédito'
        : 'Credit'
      : form.intent === 'income'
        ? isPt
          ? 'Receita'
          : 'Income'
        : form.intent === 'transfer'
          ? isPt
            ? 'Transferência'
            : 'Transfer'
          : isPt
            ? 'Débito / Pix'
            : 'Debit / Pix';
  const programmedLabel =
    form.route === 'CREDIT' && form.installments > 1
      ? isPt
        ? `${form.installments} meses no crédito`
        : `${form.installments} months on credit`
      : form.isRecurring
        ? form.programmedChargeEndMode === 'times' && form.programmedChargeCount
          ? isPt
            ? `${form.programmedChargeCount} vezes`
            : `${form.programmedChargeCount} times`
          : form.programmedChargeEndMode === 'end-date' && form.recurrenceEndDate
            ? `${isPt ? 'Até' : 'Until'} ${new Intl.DateTimeFormat(
                getLocaleForLanguage(language),
              ).format(new Date(`${form.recurrenceEndDate}T00:00:00`))}`
            : isPt
              ? 'Sem fim definido'
              : 'No end date'
        : isPt
          ? 'Só este mês'
          : 'This month only';
  const statusLabel =
    form.route === 'CREDIT' && form.installments > 1
      ? t.finance.statusPending
      : form.status === 'PAID'
        ? t.finance.statusPaid
        : t.finance.statusPending;

  return (
    <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
        {t.finance.reviewLabel}
      </p>
      <div className="mt-4 grid gap-3 text-sm text-[var(--foreground)]/68">
        <div className="flex items-center justify-between gap-4">
          <span>{t.finance.typeLabel}</span>
          <strong className="text-[var(--foreground)]">{routeLabel}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>{t.finance.amountLabel}</span>
          <strong className="text-[var(--foreground)]">
            {formatCurrencyForLanguage(language, amount, form.currency)}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>{t.finance.accountLabel}</span>
          <strong className="text-[var(--foreground)]">{account}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>{isPt ? 'Rota' : 'Route'}</span>
          <strong className="text-[var(--foreground)]">{paymentMethod}</strong>
        </div>
        {form.intent !== 'transfer' ? (
          <div className="flex items-center justify-between gap-4">
            <span>{isPt ? 'Categoria' : 'Category'}</span>
            <strong className="text-[var(--foreground)]">{category}</strong>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <span>{t.finance.statusLabel}</span>
          <strong className="text-[var(--foreground)]">{statusLabel}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>{isPt ? 'Programado' : 'Scheduled'}</span>
          <strong className="text-[var(--foreground)]">{programmedLabel}</strong>
        </div>
        {form.isRecurring && form.isSubscription ? (
          <div className="flex items-center justify-between gap-4">
            <span>{isPt ? 'Tipo recorrente' : 'Recurring type'}</span>
            <strong className="text-[var(--foreground)]">
              {isPt ? 'Assinatura' : 'Subscription'}
            </strong>
          </div>
        ) : null}
      </div>
    </aside>
  );
}