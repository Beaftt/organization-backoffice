'use client';

import { Input } from '@/components/ui/Input';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
} from '@/lib/api/finance';
import { useLanguage } from '@/lib/i18n/language-context';

import {
  getCreditPaymentMethods,
  getImmediateBehaviorOptions,
  getSelectableAccounts,
} from './transaction-editor-model';
import type { FinanceTransactionComposerForm } from './transaction-composer-model';

type FinanceTransactionContextStepProps = {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  form: FinanceTransactionComposerForm;
  paymentMethods: FinancePaymentMethod[];
  onFieldChange: <K extends keyof FinanceTransactionComposerForm>(
    field: K,
    value: FinanceTransactionComposerForm[K],
  ) => void;
};

export function FinanceTransactionContextStep({
  accounts,
  categories,
  form,
  paymentMethods,
  onFieldChange,
}: FinanceTransactionContextStepProps) {
  const { language, t } = useLanguage();
  const isPt = language === 'pt';
  const selectableAccounts = getSelectableAccounts(accounts);
  const immediateOptions = getImmediateBehaviorOptions(
    form.accountId,
    paymentMethods,
    form.group,
    form.paymentMethodId,
  );
  const creditMethods = getCreditPaymentMethods(paymentMethods);
  const visibleCategories = categories.filter((category) => category.group === form.group);
  const statusLocked = form.route === 'CREDIT' && form.installments > 1;
  const primaryAccountLabel = isPt ? 'Conta principal' : 'Main account';
  const immediateFlowLabel = isPt ? 'Como isso passa por essa conta?' : 'How does this go through this account?';
  const chosenCardLabel = isPt ? 'Cartão escolhido' : 'Selected card';
  const installmentChoices = isPt ? ['1x', 'Parcelado'] : ['1x', 'Split'];
  const noCategoryLabel = isPt ? 'Sem categoria' : 'No category';

  return (
    <div className="grid gap-5">
      {form.route === 'IMMEDIATE' ? (
        <>
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
              {primaryAccountLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectableAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => onFieldChange('accountId', account.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    form.accountId === account.id
                      ? 'border-[var(--sidebar)] bg-[var(--sidebar)] text-white'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]/72 hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  {account.name}
                </button>
              ))}
            </div>
          </div>

          {immediateOptions.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
                {immediateFlowLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {immediateOptions.map((option) => {
                  const active =
                    form.immediateBehavior === option.kind &&
                    (form.paymentMethodId || '') === (option.paymentMethodId || '');

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onFieldChange('immediateBehavior', option.kind);
                        onFieldChange('paymentMethodId', (option.paymentMethodId ?? '') as FinanceTransactionComposerForm['paymentMethodId']);
                      }}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/10 text-[var(--sidebar)]'
                          : 'border-[var(--border)] text-[var(--foreground)]/72 hover:bg-[var(--surface-muted)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]/45">
            {chosenCardLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {creditMethods.map((paymentMethod) => (
              <button
                key={paymentMethod.id}
                type="button"
                onClick={() => onFieldChange('paymentMethodId', paymentMethod.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  form.paymentMethodId === paymentMethod.id
                    ? 'border-[var(--sidebar)] bg-[var(--sidebar)] text-white'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]/72 hover:bg-[var(--surface-muted)]'
                }`}
              >
                {paymentMethod.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {installmentChoices.map((label, index) => {
              const isInstallment = index === 1;
              const active = isInstallment ? form.installments > 1 : form.installments === 1;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onFieldChange('installments', (isInstallment ? 2 : 1) as FinanceTransactionComposerForm['installments'])}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-[var(--sidebar)] bg-[var(--sidebar)]/10 text-[var(--sidebar)]'
                      : 'border-[var(--border)] text-[var(--foreground)]/72 hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t.finance.dateLabel}
          type="date"
          value={form.occurredAt}
          onChange={(event) => onFieldChange('occurredAt', event.target.value)}
        />

        <div className="grid gap-2">
          <p className="text-sm font-medium text-[var(--foreground)]/90">{t.finance.statusLabel}</p>
          <div className="flex flex-wrap gap-2">
            {[{ id: 'PAID', label: t.finance.statusPaid }, { id: 'PENDING', label: t.finance.statusPending }].map((status) => (
              <button
                key={status.id}
                type="button"
                onClick={() => onFieldChange('status', status.id as FinanceTransactionComposerForm['status'])}
                disabled={statusLocked && status.id === 'PAID'}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  form.status === status.id
                    ? 'border-[var(--sidebar)] bg-[var(--sidebar)] text-white'
                    : 'border-[var(--border)] text-[var(--foreground)]/72 hover:bg-[var(--surface-muted)]'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {form.intent !== 'transfer' ? (
        <label className="flex flex-col gap-2 text-sm text-[var(--foreground)]/70">
          <span className="font-medium text-[var(--foreground)]/90">{t.finance.typeLabel}</span>
          <select
            value={form.categoryId}
            onChange={(event) => onFieldChange('categoryId', event.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="">{noCategoryLabel}</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}