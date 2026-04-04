'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceAccount } from '@/lib/api/finance';

import { FinanceOverlayShell } from './FinanceOverlayShell';

export type AccountFormState = {
  name: string;
  type: 'CASH' | 'BANK' | 'CARD';
  currency: string;
  isPrimary: boolean;
};

interface AccountDrawerProps {
  open: boolean;
  editing: FinanceAccount | null;
  form: AccountFormState;
  formError: string | null;
  isSaving: boolean;
  presentation?: 'modal' | 'drawer';
  onClose: () => void;
  onChange: (patch: Partial<AccountFormState>) => void;
  onSave: () => void;
  onDelete: (account: FinanceAccount) => void;
}

export function AccountDrawer({
  open,
  editing,
  form,
  formError,
  isSaving,
  presentation = 'modal',
  onClose,
  onChange,
  onSave,
  onDelete,
}: AccountDrawerProps) {
  const { t } = useLanguage();
  const title = editing
    ? t.finance.editAction ?? 'Editar conta'
    : t.finance.newAccount ?? 'Nova conta';

  return (
    <FinanceOverlayShell
      open={open}
      title={title}
      ariaLabel={title}
      variant={presentation}
      size="sm"
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
          label={t.finance.accountLabel}
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
          {t.finance.accountTypeLabel ?? 'Tipo'}
          <select
            value={form.type}
            onChange={(event) =>
              onChange({ type: event.target.value as 'CASH' | 'BANK' | 'CARD' })
            }
            className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          >
            <option value="BANK">Bank</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
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
