'use client';

import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
} from '@/lib/api/finance';
import { formatCurrency } from '@/lib/utils/currency';

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
  const amount = parseCurrencyInput(form.amount);
  const account = accounts.find((item) => item.id === form.accountId)?.name ?? 'Sem conta';
  const category = categories.find((item) => item.id === form.categoryId)?.name ?? 'Sem categoria';
  const paymentMethod =
    paymentMethods.find((item) => item.id === form.paymentMethodId)?.name ??
    (form.immediateBehavior === 'BALANCE' ? 'Saldo da conta' : 'Sem método');
  const routeLabel =
    form.intent === 'credit'
      ? 'Crédito'
      : form.intent === 'income'
        ? 'Receita'
        : form.intent === 'transfer'
          ? 'Transferência'
          : 'Débito / Pix';
  const programmedLabel =
    form.route === 'CREDIT' && form.installments > 1
      ? `${form.installments} meses no crédito`
      : form.isRecurring
        ? form.programmedChargeEndMode === 'times' && form.programmedChargeCount
          ? `${form.programmedChargeCount} vezes`
          : form.programmedChargeEndMode === 'end-date' && form.recurrenceEndDate
            ? `Até ${new Intl.DateTimeFormat('pt-BR').format(new Date(`${form.recurrenceEndDate}T00:00:00`))}`
            : 'Sem fim definido'
        : 'Só este mês';

  return (
    <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--foreground)]/45">
        Resumo adaptativo
      </p>
      <div className="mt-4 grid gap-3 text-sm text-[var(--foreground)]/68">
        <div className="flex items-center justify-between gap-4">
          <span>Tipo</span>
          <strong className="text-[var(--foreground)]">{routeLabel}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Valor</span>
          <strong className="text-[var(--foreground)]">
            {amount ? formatCurrency(amount, form.currency) : 'R$ 0,00'}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Conta</span>
          <strong className="text-[var(--foreground)]">{account}</strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Rota</span>
          <strong className="text-[var(--foreground)]">{paymentMethod}</strong>
        </div>
        {form.intent !== 'transfer' ? (
          <div className="flex items-center justify-between gap-4">
            <span>Categoria</span>
            <strong className="text-[var(--foreground)]">{category}</strong>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <span>Status</span>
          <strong className="text-[var(--foreground)]">
            {form.route === 'CREDIT' && form.installments > 1 ? 'Pendente' : form.status === 'PAID' ? 'Pago' : 'Pendente'}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Programado</span>
          <strong className="text-[var(--foreground)]">{programmedLabel}</strong>
        </div>
      </div>
    </aside>
  );
}