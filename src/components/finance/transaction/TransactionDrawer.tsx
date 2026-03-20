'use client';

import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/language-context';
import { TransactionFormBody, type TransactionFormState } from './TransactionFormBody';
import type {
  FinanceAccount,
  FinanceCategory,
  FinancePaymentMethod,
  FinanceTag,
  FinanceTransaction,
} from '@/lib/api/finance';

interface TransactionDrawerProps {
  open: boolean;
  editing: FinanceTransaction | null;
  form: TransactionFormState;
  activeTab: 'details' | 'recurrence';
  accounts: FinanceAccount[];
  paymentMethods: FinancePaymentMethod[];
  categories: FinanceCategory[];
  tags: FinanceTag[];
  members: { userId: string; label: string; photoUrl: string | null }[];
  tagDraft: string;
  cardMethods: FinancePaymentMethod[];
  investMethods: FinancePaymentMethod[];
  formError: string | null;
  isSaving: boolean;
  onClose: () => void;
  onChange: (patch: Partial<TransactionFormState>) => void;
  onTabChange: (tab: 'details' | 'recurrence') => void;
  onTagDraftChange: (value: string) => void;
  onTagToggle: (tagId: string) => void;
  onTagAdd: () => void;
  onTagSuggest: (name: string) => void;
  onSave: () => void;
  formatCurrencyInput: (digits: string, currency: string) => string;
  parseCurrencyInput: (value: string) => number;
}

export function TransactionDrawer({
  open,
  editing,
  form,
  activeTab,
  accounts,
  paymentMethods,
  categories,
  tags,
  members,
  tagDraft,
  cardMethods,
  investMethods,
  formError,
  isSaving,
  onClose,
  onChange,
  onTabChange,
  onTagDraftChange,
  onTagToggle,
  onTagAdd,
  onTagSuggest,
  onSave,
  formatCurrencyInput,
  parseCurrencyInput,
}: TransactionDrawerProps) {
  const { t } = useLanguage();

  // Derive submit button color from effective type
  const isInvestSelected = investMethods.some((m) => m.id === form.paymentMethodId);
  const saveButtonBg = isInvestSelected
    ? 'bg-blue-600 hover:brightness-110'
    : form.group === 'INCOME'
    ? 'bg-emerald-600 hover:brightness-110'
    : 'bg-red-600 hover:brightness-110';

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
        className="modal-content w-full max-w-lg flex flex-col bg-[var(--surface)] rounded-2xl shadow-2xl"
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
        role="dialog"
        aria-modal="true"
        aria-label={editing ? t.finance.editAction : t.finance.newTransaction}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b [border-color:var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {editing ? t.finance.editAction : t.finance.newTransaction}
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
          <TransactionFormBody
            form={form}
            activeTab={activeTab}
            editing={editing}
            accounts={accounts}
            paymentMethods={paymentMethods}
            categories={categories}
            tags={tags}
            members={members}
            tagDraft={tagDraft}
            cardMethods={cardMethods}
            investMethods={investMethods}
            onChange={onChange}
            onTabChange={onTabChange}
            onTagDraftChange={onTagDraftChange}
            onTagToggle={onTagToggle}
            onTagAdd={onTagAdd}
            onTagSuggest={onTagSuggest}
            formatCurrencyInput={formatCurrencyInput}
            parseCurrencyInput={parseCurrencyInput}
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t [border-color:var(--border)] px-5 py-4">
          {formError ? (
            <p className="mb-3 text-sm text-[var(--expense)]">{formError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              {t.finance.cancel}
            </Button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${saveButtonBg}`}
            >
              {isSaving ? t.finance.saving : t.finance.save}
            </button>          </div>
        </div>
      </div>
      </div>
    </>,
    document.body
  );
}
