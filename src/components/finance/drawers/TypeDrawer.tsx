'use client';

import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/language-context';

interface TypeDrawerProps {
  open: boolean;
  name: string;
  group: 'INCOME' | 'EXPENSE';
  formError: string | null;
  isSaving: boolean;
  title?: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onGroupChange: (value: 'INCOME' | 'EXPENSE') => void;
  onSave: () => void;
}

export function TypeDrawer({
  open,
  name,
  group,
  formError,
  isSaving,
  title,
  onClose,
  onNameChange,
  onGroupChange,
  onSave,
}: TypeDrawerProps) {
  const { t } = useLanguage();
  const dialogTitle = title ?? t.finance.newType;

  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label={t.finance.close ?? 'Close'}
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
        aria-label={dialogTitle}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b [border-color:var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">{dialogTitle}</h2>
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
              label={t.finance.typeLabel}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground)]/60">
              {t.finance.groupLabel}
              <select
                value={group}
                onChange={(e) => onGroupChange(e.target.value as 'INCOME' | 'EXPENSE')}
                className="rounded-xl border [border-color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
              >
                <option value="INCOME">{t.finance.groupIncome}</option>
                <option value="EXPENSE">{t.finance.groupExpense}</option>
              </select>
            </label>
          </div>
        </div>
        {/* Footer */}
        <div className="shrink-0 border-t [border-color:var(--border)] px-5 py-4">
          {formError ? <p className="mb-3 text-sm text-[var(--expense)]">{formError}</p> : null}
          <div className="flex justify-end gap-2">
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
