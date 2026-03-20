'use client';

import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';
import type { FinanceAccount } from '@/lib/api/finance';

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
  onClose,
  onChange,
  onSave,
  onDelete,
}: AccountDrawerProps) {
  const { t } = useLanguage();

  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Fechar"
        className="modal-overlay fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Centered modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-content w-full max-w-sm flex flex-col bg-[var(--surface)] rounded-2xl shadow-2xl"
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
        role="dialog"
        aria-modal="true"
        aria-label={editing ? (t.finance.editAction ?? 'Editar conta') : (t.finance.newAccount ?? 'Nova conta')}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b [border-color:var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {editing ? (t.finance.editAction ?? 'Editar conta') : (t.finance.newAccount ?? 'Nova conta')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.finance.close ?? 'Fechar'}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground)]/50 transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-4">
            <Input
              label={t.finance.accountLabel}
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
              {t.finance.accountTypeLabel ?? 'Tipo'}
              <select
                value={form.type}
                onChange={(e) => onChange({ type: e.target.value as 'CASH' | 'BANK' | 'CARD' })}
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
                onChange={(e) => onChange({ currency: e.target.value })}
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
                onChange={(e) => onChange({ isPrimary: e.target.checked })}
                className="h-4 w-4 rounded accent-[var(--sidebar)]"
              />
              {t.finance.setPrimary ?? 'Definir como principal'}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t [border-color:var(--border)] px-5 py-4">
          {formError ? <p className="mb-3 text-sm text-[var(--expense)]">{formError}</p> : null}
          <div className="flex flex-wrap justify-end gap-2">
            {editing ? (
              <Button variant="danger" onClick={() => onDelete(editing)} disabled={isSaving}>
                {t.finance.deleteAction}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>{t.finance.cancel}</Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? t.finance.saving : t.finance.save}
            </Button>
          </div>
        </div>
      </div>
      </div>
    </>,
    document.body
  );
}
