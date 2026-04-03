'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceAccount, FinancePaymentMethod, FinancePaymentMethodType } from '@/lib/api/finance';

import { FinanceOverlayShell } from './FinanceOverlayShell';

export type PaymentMethodFormState = {
  name: string;
  type: FinancePaymentMethodType;
  accountId: string;
  currency: string;
  limit: string;
  closingDay: string;
  dueDay: string;
  balance: string;
  isPrimary: boolean;
};

interface PaymentMethodDrawerProps {
  open: boolean;
  editing: FinancePaymentMethod | null;
  form: PaymentMethodFormState;
  accounts: FinanceAccount[];
  formError: string | null;
  isSaving: boolean;
  presentation?: 'modal' | 'drawer';
  onClose: () => void;
  onChange: (patch: Partial<PaymentMethodFormState>) => void;
  onSave: () => void;
  onDelete: (method: FinancePaymentMethod) => void;
  formatCurrencyInput: (digits: string, currency: string) => string;
}

export function PaymentMethodDrawer({
  open,
  editing,
  form,
  accounts,
  formError,
  isSaving,
  presentation = 'modal',
  onClose,
  onChange,
  onSave,
  onDelete,
  formatCurrencyInput,
}: PaymentMethodDrawerProps) {
  const { t } = useLanguage();
  const title = editing
    ? t.finance.editAction ?? 'Editar'
    : t.finance.paymentMethodTitle ?? t.finance.paymentMethodsTitle ?? 'Novo método';

  return (
    <FinanceOverlayShell
      open={open}
      title={title}
      ariaLabel={title}
      variant={presentation}
      size="md"
      onClose={onClose}
      footer={
        <>
          {formError ? <p className="mb-3 text-sm text-[var(--expense)]">{formError}</p> : null}
          <div className="flex flex-wrap justify-end gap-2">
            {editing ? (
              <Button variant="danger" onClick={() => onDelete(editing)} disabled={isSaving}>
                {t.finance.deleteAction}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              {t.finance.cancel}
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? t.finance.saving : t.finance.save}
            </Button>
          </div>
        </>
      }
    >
      <div className="grid gap-4">
        <Input
          label={t.finance.paymentMethodNameLabel ?? t.finance.titleLabel}
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.finance.paymentMethodTypeLabel ?? t.finance.typeLabel}
            <select
              value={form.type}
              onChange={(event) =>
                onChange({ type: event.target.value as FinancePaymentMethodType })
              }
              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            >
              <option value="CREDIT">{t.finance.paymentMethodCredit ?? 'Crédito'}</option>
              <option value="DEBIT">{t.finance.paymentMethodDebit ?? 'Débito'}</option>
              <option value="PIX">{t.finance.paymentMethodPix ?? 'Pix'}</option>
              <option value="INVEST">{t.finance.paymentMethodInvest ?? 'Investimento'}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.finance.paymentMethodAccountLabel ?? t.finance.accountLabel}
            <select
              value={form.accountId}
              onChange={(event) => onChange({ accountId: event.target.value })}
              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            >
              <option value="">{t.finance.none}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
            {t.finance.currencyLabel ?? 'Moeda'}
            <select
              value={form.currency}
              onChange={(event) => onChange({ currency: event.target.value })}
              className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            >
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
          </label>

          <Input
            label={t.finance.balanceLabel ?? 'Saldo'}
            value={form.balance}
            onChange={(event) => onChange({ balance: event.target.value })}
          />
        </div>

        {form.type === 'CREDIT' ? (
          <div className="grid gap-3 rounded-2xl border [border-color:var(--border)] px-4 py-3 sm:grid-cols-3">
            <Input
              label={t.finance.paymentMethodLimitLabel ?? 'Limite'}
              value={form.limit}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '');
                onChange({ limit: formatCurrencyInput(digits, form.currency) });
              }}
            />
            <Input
              label={t.finance.paymentMethodClosingDayLabel ?? 'Fechamento'}
              type="date"
              value={form.closingDay}
              onChange={(event) => onChange({ closingDay: event.target.value })}
            />
            <Input
              label={t.finance.paymentMethodDueDayLabel ?? 'Vencimento'}
              type="date"
              value={form.dueDay}
              onChange={(event) => onChange({ dueDay: event.target.value })}
            />
          </div>
        ) : null}

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPrimary}
            onChange={(event) => onChange({ isPrimary: event.target.checked })}
            className="h-4 w-4 rounded accent-[var(--sidebar)]"
          />
          {t.finance.setPrimary ?? 'Definir como principal'}
        </label>
      </div>
    </FinanceOverlayShell>
  );
}
