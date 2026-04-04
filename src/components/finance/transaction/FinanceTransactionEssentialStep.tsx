'use client';

import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';

import { formatCurrencyInput } from './transaction-editor-model';
import type { FinanceTransactionComposerForm } from './transaction-composer-model';

type FinanceTransactionEssentialStepProps = {
  form: FinanceTransactionComposerForm;
  onIntentChange: (intent: FinanceTransactionComposerForm['intent']) => void;
  onFieldChange: <K extends keyof FinanceTransactionComposerForm>(
    field: K,
    value: FinanceTransactionComposerForm[K],
  ) => void;
};

export function FinanceTransactionEssentialStep({
  form,
  onIntentChange,
  onFieldChange,
}: FinanceTransactionEssentialStepProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const composerIntents = [
    {
      id: 'expense',
      label: isPt ? 'Débito / Pix' : 'Debit / Pix',
      description: isPt ? 'Sai da conta agora.' : 'Leaves the account right away.',
    },
    {
      id: 'credit',
      label: isPt ? 'Crédito' : 'Credit',
      description: isPt ? 'Entra no cartão e pode virar parcelas.' : 'Goes to the card and can become installments.',
    },
    {
      id: 'income',
      label: t.finance.groupIncome,
      description: isPt ? 'Entra na conta neste mês.' : 'Comes into the account this month.',
    },
    {
      id: 'transfer',
      label: isPt ? 'Transferência' : 'Transfer',
      description: isPt ? 'Move dinheiro entre contas.' : 'Moves money between accounts.',
    },
  ] as const;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-2">
        {composerIntents.map((intent) => {
          const active = form.intent === intent.id;

          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => onIntentChange(intent.id)}
              className={`rounded-[24px] border px-4 py-4 text-left transition-colors ${
                active
                  ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/10 text-[var(--foreground)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]/72 hover:bg-[var(--surface-muted)]'
              }`}
            >
              <p className="text-sm font-semibold">{intent.label}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--foreground)]/58">
                {intent.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
          <span className="font-medium text-[var(--foreground)]/90">{t.finance.amountLabel}</span>
          <input
            inputMode="numeric"
            value={form.amount}
            onChange={(event) =>
              onFieldChange(
                'amount',
                formatCurrencyInput(
                  event.target.value.replace(/\D/g, ''),
                  form.currency,
                ) as FinanceTransactionComposerForm['amount'],
              )
            }
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-zinc-400"
            placeholder="R$ 0,00"
          />
        </label>

        <Input
          label={isPt ? 'Nome' : 'Name'}
          value={form.title}
          onChange={(event) => onFieldChange('title', event.target.value)}
          placeholder={isPt ? 'Ex.: mercado, salário, Uber' : 'Ex.: groceries, salary, Uber'}
        />
      </div>
    </div>
  );
}